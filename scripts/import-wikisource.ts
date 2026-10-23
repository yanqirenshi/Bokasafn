/**
 * 中文版ウィキソース (zh.wikisource.org) から本を取り込み、SQLite に保存する。
 *
 *   npm run import            # 全冊
 *   npm run import -- nanjing # slug を指定して一冊だけ
 *
 * 取得した HTML は data/cache/ に保存し、再実行時はそれを使う（API への負荷を避けるため）。
 */
import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../src/lib/db";

type BookConfig = {
  slug: string;
  page: string;
  title: string;
  author: string;
  era: string;
  description: string;
  spineColor: string;
  /** 目次ページから「書名/〜」のサブページを辿って本文を集める */
  hasSubpages?: boolean;
};

// ctext.org「醫家」(https://ctext.org/chinese-medicine/zhs) の収録書に対応する書目
const BOOKS: BookConfig[] = [
  {
    slug: "huangdi-neijing",
    page: "黃帝內經",
    title: "黃帝內經",
    author: "佚名（託名 黃帝・岐伯）",
    era: "戰國〜西漢",
    description: "現存最古の中国医学の理論書。素問と靈樞の二部からなる。",
    spineColor: "#7a2e2a",
    hasSubpages: true,
  },
  {
    slug: "nanjing",
    page: "難經",
    title: "難經",
    author: "託名 扁鵲",
    era: "東漢",
    description: "黃帝內經の要点を八十一の問答で論じた書。黃帝八十一難經とも。",
    spineColor: "#2f4a3a",
  },
  {
    slug: "shennong-bencao-jing",
    page: "神農本草經",
    title: "神農本草經",
    author: "佚名（託名 神農）",
    era: "東漢",
    description: "現存最古の本草書。三百六十五種の薬物を上・中・下の三品に分ける。",
    spineColor: "#5b4a1f",
  },
  {
    slug: "shanghan-lun",
    page: "傷寒論",
    title: "傷寒論",
    author: "張仲景",
    era: "東漢",
    description: "外感熱病の診断と治療を六經に沿って説いた書。宋本。",
    spineColor: "#1f3550",
  },
  {
    slug: "jingui-yaolue",
    page: "金匱要略",
    title: "金匱要略",
    author: "張仲景",
    era: "東漢",
    description: "傷寒雜病論のうち雜病を扱った部分。內科・婦人科などの諸病を論じる。",
    spineColor: "#4a2f55",
  },
];

const USER_AGENT =
  "BokasafnLibrary/0.1 (personal non-commercial reading app; local use)";
const CACHE_DIR = path.join(process.cwd(), "data", "cache", "wikisource");
const REQUEST_INTERVAL_MS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pageUrl(title: string) {
  return `https://zh.wikisource.org/wiki/${encodeURIComponent(title)}`;
}

async function fetchPageHtml(title: string): Promise<string> {
  const cacheFile = path.join(CACHE_DIR, `${encodeURIComponent(title)}.html`);
  if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, "utf8");

  const url = `https://zh.wikisource.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      const html = await res.text();
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cacheFile, html);
      await sleep(REQUEST_INTERVAL_MS);
      return html;
    }
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`${title}: HTTP ${res.status}`);
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    const wait = retryAfter > 0 ? retryAfter * 1000 : 15_000 * 2 ** attempt;
    console.warn(`  ${title}: HTTP ${res.status}, ${wait / 1000}s 待って再試行`);
    await sleep(wait);
  }
  throw new Error(`${title}: 再試行の上限に達しました`);
}

type SectionNode = { title: string; body: string; children: SectionNode[] };

const NOISE = [
  "style",
  "script",
  "meta",
  "link",
  "table",
  "figure",
  ".mw-empty-elt",
  ".mw-editsection",
  ".noprint",
  ".ws-noexport",
  "sup.reference",
  "ol.references",
  ".navbox",
  ".thumb",
].join(",");

function loadArticle(html: string) {
  const $ = cheerio.load(html);
  // -{…}- (言語変換の抑止) は Parsoid では中身が空の span になり、文字が data 属性に入っている
  $('[typeof="mw:LanguageVariant"]').each((_, el) => {
    const raw = $(el).attr("data-mw-variant");
    let text = "";
    try {
      const v = JSON.parse(raw ?? "{}");
      const t =
        v.disabled?.t ?? v.name?.t ?? v.twoway?.[0]?.t ?? v.oneway?.[0]?.to ?? "";
      text = cheerio.load(t).text();
    } catch {}
    $(el).replaceWith(text);
  });
  $(NOISE).remove();
  return $;
}

function textOf($: cheerio.CheerioAPI, el: Element): string {
  const clone = $(el).clone();
  // ソース上の改行は表示では詰められるので消し、<br> だけを改行として残す
  clone.find("br").replaceWith(" ");
  return clone
    .text()
    .replace(/[ \t]*\n[ \t]*/g, "")
    .split(" ")
    .map((line) => line.replace(/\s+$/u, ""))
    .join("\n")
    .replace(/^\n+|\n+$/g, "");
}

/** 見出しやサブセクション以外のブロック要素から段落を集める */
function collectParagraphs($: cheerio.CheerioAPI, nodes: AnyNode[], out: string[]) {
  for (const node of nodes) {
    if (node.type === "text") {
      const t = (node.data ?? "").trim();
      if (t) out.push(t);
      continue;
    }
    if (node.type !== "tag") continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "section" || /^h[1-6]$/.test(tag)) continue;
    if (tag === "p" || tag === "pre" || tag === "dt" || tag === "dd" || tag === "li") {
      const hasBlocks = $(el).children("ul,ol,dl,div,p").length > 0;
      if (hasBlocks) {
        collectParagraphs($, el.children, out);
      } else {
        const t = textOf($, el);
        if (t.trim()) out.push(t);
      }
      continue;
    }
    if (["div", "blockquote", "center", "ul", "ol", "dl", "span", "b", "i", "a", "small", "big", "font"].includes(tag)) {
      if (["span", "b", "i", "a", "small", "big", "font"].includes(tag)) {
        const t = textOf($, el);
        if (t.trim()) out.push(t);
      } else {
        collectParagraphs($, el.children, out);
      }
    }
  }
}

function parseSection($: cheerio.CheerioAPI, section: Element): SectionNode {
  const heading = $(section).children("h1,h2,h3,h4,h5,h6").first();
  const paragraphs: string[] = [];
  collectParagraphs($, section.children, paragraphs);
  return {
    title: heading.text().trim(),
    body: paragraphs.join("\n\n"),
    children: $(section)
      .children("section")
      .toArray()
      .map((s) => parseSection($, s)),
  };
}

/** ページ全体を、先頭の前置き (body) と見出しごとのセクション (children) に分ける */
function parsePage(html: string): SectionNode {
  const $ = loadArticle(html);
  const sections = $("body > section").toArray();
  const lead = sections.find((s) => $(s).attr("data-mw-section-id") === "0");
  const leadNode = lead ? parseSection($, lead) : undefined;
  return {
    title: "",
    body: leadNode?.body ?? "",
    children: sections.filter((s) => s !== lead).map((s) => parseSection($, s)),
  };
}

/** 目次ページの見出しごとに、サブページへのリンクを順番に拾う */
function parseIndexPage(html: string, book: string) {
  const $ = loadArticle(html);
  return $("body > section")
    .toArray()
    .filter((s) => $(s).children("h2").length > 0)
    .map((s) => ({
      title: $(s).children("h2").text().trim(),
      links: $(s)
        .find('a[rel="mw:WikiLink"]')
        .toArray()
        .map((a) => ({ title: $(a).attr("title") ?? "", label: $(a).text().trim() }))
        .filter((l) => l.title.startsWith(`${book}/`)),
    }))
    .filter((part) => part.links.length > 0);
}

async function buildTree(book: BookConfig): Promise<SectionNode> {
  const html = await fetchPageHtml(book.page);
  if (!book.hasSubpages) return parsePage(html);

  const root: SectionNode = { title: "", body: "", children: [] };
  for (const part of parseIndexPage(html, book.page)) {
    const partNode: SectionNode = { title: part.title, body: "", children: [] };
    for (const link of part.links) {
      console.log(`  ${link.title}`);
      const page = parsePage(await fetchPageHtml(link.title));
      partNode.children.push({ title: link.label, body: page.body, children: page.children });
    }
    root.children.push(partNode);
  }
  return root;
}

function prune(node: SectionNode): SectionNode | undefined {
  const children = node.children.map(prune).filter((c): c is SectionNode => !!c);
  if (!node.body.trim() && children.length === 0) return undefined;
  return { ...node, children };
}

function save(book: BookConfig, position: number, tree: SectionNode) {
  const db = getDb();
  const insertBook = db.prepare(`
    INSERT INTO books (slug, title, author, era, category, description, spine_color, position,
                       source_name, source_url, license, imported_at)
    VALUES (@slug, @title, @author, @era, '醫家', @description, @spineColor, @position,
            '維基文庫', @sourceUrl, 'Public domain', datetime('now'))`);
  const insertSection = db.prepare(`
    INSERT INTO sections (book_id, parent_id, position, depth, title, body)
    VALUES (?, ?, ?, ?, ?, ?)`);

  let count = 0;
  db.transaction(() => {
    db.prepare("DELETE FROM books WHERE slug = ?").run(book.slug);
    const bookId = insertBook.run({
      ...book,
      position,
      sourceUrl: pageUrl(book.page),
    }).lastInsertRowid;

    const walk = (node: SectionNode, parentId: number | bigint | null, depth: number) => {
      const id = insertSection.run(bookId, parentId, count++, depth, node.title, node.body)
        .lastInsertRowid;
      for (const child of node.children) walk(child, id, depth + 1);
    };
    // 前置き (序など見出しのない冒頭部分) は「卷首」として先頭に置く
    if (tree.body.trim()) walk({ title: "卷首", body: tree.body, children: [] }, null, 0);
    for (const child of tree.children) walk(child, null, 0);
  })();
  return count;
}

async function main() {
  const only = process.argv.slice(2);
  for (const [i, book] of BOOKS.entries()) {
    if (only.length && !only.includes(book.slug)) continue;
    console.log(`${book.title} (${book.page})`);
    const tree = prune(await buildTree(book)) ?? { title: "", body: "", children: [] };
    const count = save(book, i, tree);
    console.log(`  → ${count} セクションを保存`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

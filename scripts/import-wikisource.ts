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
  /** 本文から取り除く段落（注釈へのリンクだけの段落など） */
  dropParagraphs?: string[];
};

// ctext.org「醫家」(https://ctext.org/chinese-medicine/zhs) の収録書に対応する書目
const MEDICINE: BookConfig[] = [
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

// ctext.org「道家」(https://ctext.org/daoism/zhs) の収録書に対応する書目
const DAOISM: BookConfig[] = [
  {
    slug: "dao-de-jing",
    page: "道德經 (王弼本)",
    title: "道德經",
    author: "老子",
    era: "春秋",
    description: "道と徳を説く五千余字の書。道家の根本となる經典。王弼本。",
    spineColor: "#2d4a5a",
  },
  {
    slug: "zhuangzi",
    page: "莊子",
    title: "莊子",
    author: "莊周",
    era: "戰國",
    description: "內篇・外篇・雜篇の三十三篇。寓話を通して自然と無為を説く。",
    spineColor: "#3b5a3a",
    hasSubpages: true,
  },
  {
    slug: "liezi",
    page: "列子",
    title: "列子",
    author: "列禦寇",
    era: "戰國",
    description: "天瑞・黃帝など八篇。寓話によって道家の思想を説く。沖虛真經とも。",
    spineColor: "#6a4a2a",
    hasSubpages: true,
  },
  {
    slug: "wenzi",
    page: "文子",
    title: "文子",
    author: "文子",
    era: "戰國",
    description: "老子の言葉を敷衍して説いた書。通玄真經とも。",
    spineColor: "#5a3a4a",
    hasSubpages: true,
  },
  {
    slug: "heguanzi",
    page: "鶡冠子",
    title: "鶡冠子",
    author: "鶡冠子",
    era: "戰國",
    description: "楚の隱者の作と伝わる十九篇。道家に兵家・法家の思想を交える。",
    spineColor: "#4a4a2a",
  },
  {
    slug: "guanyinzi",
    page: "關尹子",
    title: "關尹子",
    author: "託名 尹喜",
    era: "不詳（託名 先秦）",
    description: "老子に道德經を書かせた關令尹喜の作と伝わる九篇。文始真經とも。",
    spineColor: "#2a3a5a",
    hasSubpages: true,
  },
  {
    slug: "yinfujing",
    page: "黃帝陰符經",
    title: "陰符經",
    author: "託名 黃帝",
    era: "不詳",
    description: "三百余字の短い經典。天の道と人の営みの関わりを説く。",
    spineColor: "#1f1f2f",
  },
  {
    slug: "liexian-zhuan",
    page: "列仙傳",
    title: "列仙傳",
    author: "託名 劉向",
    era: "西漢",
    description: "赤松子・老子・彭祖など、古の仙人七十余人の伝記を集めた書。",
    spineColor: "#5a2a2a",
  },
  {
    slug: "baopuzi",
    page: "抱朴子",
    title: "抱朴子",
    author: "葛洪",
    era: "東晉",
    description: "內篇は神仙・煉丹の術を、外篇は政治や世の中のあり方を論じる。",
    spineColor: "#3a2a1a",
    hasSubpages: true,
  },
];

// ctext.org「儒家」(https://ctext.org/confucianism/zhs) の収録書に対応する書目
// （大學・中庸は禮記の篇として収める）
const CONFUCIANISM: BookConfig[] = [
  {
    slug: "lunyu",
    page: "論語",
    title: "論語",
    author: "孔子の弟子たち",
    era: "春秋〜戰國",
    description: "孔子と弟子たちの言行を記した二十篇。儒家の根本となる書。",
    spineColor: "#6a2a2a",
    hasSubpages: true,
    // 各篇の先頭にある注釈ページへのリンク
    dropParagraphs: ["註疏"],
  },
  {
    slug: "mengzi",
    page: "孟子",
    title: "孟子",
    author: "孟軻",
    era: "戰國",
    description: "孟子の言行録。性善説と仁義による王道政治を説く。",
    spineColor: "#2a4a6a",
    hasSubpages: true,
  },
  {
    slug: "liji",
    page: "禮記",
    title: "禮記",
    author: "戴聖 編",
    era: "西漢",
    description: "礼についての論説を集めた四十九篇。大學・中庸を含む。",
    spineColor: "#4a3a1a",
    hasSubpages: true,
  },
  {
    slug: "xunzi",
    page: "荀子",
    title: "荀子",
    author: "荀況",
    era: "戰國",
    description: "性悪説を唱え、礼と学びによる人の教化を説く三十二篇。",
    spineColor: "#3a4a3a",
    hasSubpages: true,
  },
  {
    slug: "xiaojing",
    // 「孝經」は版本の一覧ページなので、今文孝經を使う
    page: "今文孝經",
    title: "孝經",
    author: "託名 曾子",
    era: "戰國〜秦漢",
    description: "孝を徳の根本として説く短い經典。",
    spineColor: "#7a5a2a",
  },
  {
    slug: "da-dai-liji",
    page: "大戴禮記",
    title: "大戴禮記",
    author: "戴德 編",
    era: "西漢",
    description: "禮記と並ぶ、礼についての論説集。",
    spineColor: "#5a4a2a",
    hasSubpages: true,
  },
  {
    slug: "chunqiu-fanlu",
    page: "春秋繁露",
    title: "春秋繁露",
    author: "董仲舒",
    era: "西漢",
    description: "春秋公羊學に基づき、天人相関と陰陽五行を論じる。",
    spineColor: "#2a2a4a",
    hasSubpages: true,
  },
  {
    slug: "hanshi-waizhuan",
    page: "韓詩外傳",
    title: "韓詩外傳",
    author: "韓嬰",
    era: "西漢",
    description: "故事を語り、詩經の句で結ぶ説話集。十卷。",
    spineColor: "#4a2a3a",
    hasSubpages: true,
  },
  {
    slug: "xinyu",
    page: "新語",
    title: "新語",
    author: "陸賈",
    era: "西漢",
    description: "漢の高祖に、秦が滅んだわけと国を治める道を説いた十二篇。",
    spineColor: "#3a5a5a",
    hasSubpages: true,
  },
  {
    slug: "shuoyuan",
    page: "說苑",
    title: "說苑",
    author: "劉向",
    era: "西漢",
    description: "先秦から漢初までの故事・逸話を二十の部類に分けて集めた書。",
    spineColor: "#5a2a4a",
    hasSubpages: true,
  },
  {
    slug: "xinxu",
    page: "新序",
    title: "新序",
    author: "劉向",
    era: "西漢",
    description: "古の故事を集め、君主への戒めとした書。",
    spineColor: "#2a5a4a",
    hasSubpages: true,
  },
  {
    slug: "fayan",
    page: "法言",
    title: "法言",
    author: "揚雄",
    era: "西漢",
    description: "論語にならい、問答の形で儒家の道を説く十三卷。揚子法言とも。",
    spineColor: "#4a4a5a",
    hasSubpages: true,
  },
  {
    slug: "qianfu-lun",
    page: "潛夫論",
    title: "潛夫論",
    author: "王符",
    era: "東漢",
    description: "後漢の政治と社会の弊害を批判した論集。",
    spineColor: "#3a3a2a",
    hasSubpages: true,
  },
  {
    slug: "zhonglun",
    // 「中論」は佛教の中論との一覧ページなので、儒家の方を使う
    page: "中論 (儒家)",
    title: "中論",
    author: "徐幹",
    era: "東漢",
    description: "儒家の立場から、身の修め方と政治のあり方を論じる。",
    spineColor: "#5a3a3a",
    hasSubpages: true,
  },
  {
    slug: "kongzi-jiayu",
    page: "孔子家語",
    title: "孔子家語",
    author: "王肅 注",
    era: "三國魏",
    description: "孔子と弟子たちの言行・逸話を集めた書。",
    spineColor: "#6a4a3a",
    hasSubpages: true,
  },
];

// ctext.org「法家」(https://ctext.org/legalism/zhs) の収録書に対応する書目
const LEGALISM: BookConfig[] = [
  {
    slug: "hanfeizi",
    page: "韓非子",
    title: "韓非子",
    author: "韓非",
    era: "戰國",
    description: "法・術・勢による君主の統治を説く五十五篇。法家思想の集大成。",
    spineColor: "#2a2a2a",
    hasSubpages: true,
  },
  {
    slug: "shangjunshu",
    page: "商君書",
    title: "商君書",
    author: "商鞅",
    era: "戰國",
    description: "秦の変法を主導した商鞅の学派の書。農戦と厳格な法による富国強兵を説く。",
    spineColor: "#5a1a1a",
    hasSubpages: true,
  },
  {
    slug: "guanzi",
    page: "管子",
    title: "管子",
    author: "託名 管仲",
    era: "戰國〜西漢",
    description: "斉の宰相管仲の名を冠した論集。政治・経済・軍事・思想を幅広く論じる。",
    spineColor: "#1a3a3a",
    hasSubpages: true,
  },
  {
    slug: "shenzi",
    page: "慎子",
    title: "慎子",
    author: "慎到",
    era: "戰國",
    description: "勢（君主の地位と権力）の重要性を説いた慎到の書。逸文を含む。",
    spineColor: "#3a3a1a",
  },
  {
    slug: "shenzi-buhai",
    page: "申子",
    title: "申子",
    author: "申不害",
    era: "戰國",
    description: "術（臣下を操る君主の技）を説いた申不害の書の残篇と佚文。",
    spineColor: "#3a1a3a",
  },
];

const BOOKS = [
  ...MEDICINE.map((b) => ({ ...b, category: "醫家" })),
  ...DAOISM.map((b) => ({ ...b, category: "道家" })),
  ...CONFUCIANISM.map((b) => ({ ...b, category: "儒家" })),
  ...LEGALISM.map((b) => ({ ...b, category: "法家" })),
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
  "figure",
  "#headerContainer",
  ".ws-header",
  ".mw-empty-elt",
  ".mw-editsection",
  ".noprint",
  ".ws-noexport",
  "sup.reference",
  "ol.references",
  ".navbox",
  ".thumb",
  ".licenseContainer",
  ".licensetpl",
  ".pagenum",
  ".ws-pagenum",
].join(",");

/**
 * 本文の読み取り用に HTML を読み込み、本文以外の要素を取り除く。
 * 表 (table) は本文では見出し飾りやナビゲーションなので消すが、
 * 目次ページでは篇へのリンクを段組みの表に並べていることがあるので keepTables で残す。
 */
function loadArticle(html: string, { keepTables = false } = {}) {
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
  if (!keepTables) $("table").remove();
  return $;
}

/**
 * parent の中にあるセクションのうち、間に別のセクションを挟まない（一段下の）もの。
 * parent が null ならページの最上位のセクション。div などに包まれていても拾う。
 */
function childSections($: cheerio.CheerioAPI, parent: Element | null): Element[] {
  return (parent ? $(parent) : $("body"))
    .find("section")
    .toArray()
    .filter((s) => ($(s).parent().closest("section")[0] ?? null) === parent);
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
    // 「知忠〈此篇原刻全脫，依《治要》補。〉」のような見出しの注記は篇名から外す
    title: heading.text().replace(/〈[^〉]*〉/g, "").trim(),
    body: paragraphs.join("\n\n"),
    children: childSections($, section).map((s) => parseSection($, s)),
  };
}

/**
 * ページ全体を、先頭の前置き (body) と見出しごとのセクション (children) に分ける。
 * 見出しのないセクション（冒頭部分や、テンプレートで差し込まれた包み）は、
 * 本文を前置きに足し、中の見出しはそのまま章として扱う。
 */
function parsePage(html: string): SectionNode {
  const $ = loadArticle(html);
  const bodies: string[] = [];
  const children: SectionNode[] = [];
  const add = (node: SectionNode) => {
    if (node.title) return children.push(node);
    if (node.body.trim()) bodies.push(node.body);
    node.children.forEach(add);
  };
  childSections($, null).map((s) => parseSection($, s)).forEach(add);
  return { title: "", body: bodies.join("\n\n"), children };
}

/**
 * 篇の名前を決める。基本はリンクの文字だが、次の場合はページ名から作る。
 * - 「雜事/卷一」のように二段のページ名 → 「雜事 卷一」
 * - リンクの文字が「下」のように一文字だけ（「曲禮 上 下」と並べた目次）→ 「曲禮下」
 * 「一宇　宇者，道也。」のように副題が付いたリンクは、篇名だけを使う。
 */
function chapterTitle(book: string, title: string, label: string) {
  const path = title.slice(book.length + 1);
  if (path.includes("/")) return path.replaceAll("/", " ");
  if ([...label].length <= 1) return path;
  return label.split("　")[0];
}

/**
 * 目次ページの見出しごとに、サブページへのリンクを順番に拾う。
 * 見出しのない目次ページや、リンクのある見出しが「目錄」など一つだけのページは、
 * 見出しなし (title: "") の一部としてまとめる。
 */
function parseIndexPage(html: string, book: string) {
  const $ = loadArticle(html, { keepTables: true });
  const seen = new Set<string>();
  const subpageLinks = (root: cheerio.Cheerio<Element>) =>
    root
      .find('a[rel="mw:WikiLink"]')
      .toArray()
      .map((a) => {
        const raw = $(a).attr("title") ?? "";
        // 「潛夫論/ 卷一」のような書き間違いのリンクは、空白を除いたページ名で取りにいく
        const title = raw.replace(/\/\s+/g, "/").trim();
        const red = ($(a).attr("href") ?? "").includes("redlink=1");
        return { title, label: $(a).text().trim(), missing: red && title === raw };
      })
      .filter(
        (l) =>
          l.title.startsWith(`${book}/`) &&
          // 存在しないページ（赤リンク）は飛ばす
          !l.missing &&
          // 「全覽」は全篇をまとめたページなので、各篇と二重にならないよう除く
          !l.title.endsWith("/全覽") &&
          !seen.has(l.title) &&
          seen.add(l.title),
      )
      .map(({ title, label }) => ({ title, label: chapterTitle(book, title, label) }));

  let parts = childSections($, null)
    .filter((s) => $(s).children("h2").length > 0)
    .map((s) => ({ title: $(s).children("h2").text().trim(), links: subpageLinks($(s)) }))
    .filter((part) => part.links.length > 0);
  if (parts.length === 0) parts = [{ title: "", links: subpageLinks($("body")) }];
  // 見出しが一つだけのときや「目錄」の見出しは、階層にせず篇を直接並べる
  for (const part of parts) {
    if (parts.length === 1 || /^目[錄录録]$/.test(part.title)) part.title = "";
  }

  // 「善謀」と「善謀/卷上」のように親子が両方あるときは、子のページだけを使う
  const all = parts.flatMap((p) => p.links.map((l) => l.title));
  for (const part of parts) {
    part.links = part.links.filter((l) => !all.some((t) => t.startsWith(`${l.title}/`)));
  }
  return parts;
}

async function buildTree(book: BookConfig): Promise<SectionNode> {
  const html = await fetchPageHtml(book.page);
  if (html.includes("mw:PageProp/disambiguation")) {
    throw new Error(
      `「${book.page}」は版本の一覧（曖昧さ回避）ページです。本文のあるページを指定してください`,
    );
  }
  if (!book.hasSubpages) return parsePage(html);

  const root: SectionNode = { title: "", body: "", children: [] };
  // 中身がまったく同じページ（「善謀/卷上」と「善謀/卷下」がともに全文を含むなど）は一度だけ使う
  const seenContent = new Map<string, { node: SectionNode; title: string }>();
  for (const part of parseIndexPage(html, book.page)) {
    const children: SectionNode[] = [];
    for (const link of part.links) {
      console.log(`  ${link.title}`);
      const page = parsePage(await fetchPageHtml(link.title));
      // 「韓非子卷第三 > 十過第十」のように見出し一つで包まれているだけなら、中の篇を使う
      const only = !page.body.trim() && page.children.length === 1 ? page.children[0] : null;
      const node = only ?? { title: link.label, body: page.body, children: page.children };
      const content = JSON.stringify([node.body, node.children]);
      const same = seenContent.get(content);
      if (same) {
        // 同じ親ページの下の重複なら、残した方の名前を親の名前にする（「善謀 卷上」→「善謀」）
        const parent = link.title.slice(0, link.title.lastIndexOf("/"));
        if (same.title.startsWith(`${parent}/`) && parent !== book.page) {
          same.node.title = parent.slice(book.page.length + 1);
        }
        continue;
      }
      seenContent.set(content, { node, title: link.title });
      children.push(node);
    }
    // 「新語/卷上」のように、ほかの篇をまとめて載せただけのページは除く
    const titles = new Set(children.map((c) => c.title));
    const isDigest = (n: SectionNode) =>
      n.children.filter((c) => c.title !== n.title && titles.has(c.title)).length >= 2;
    const kept = children.filter((n) => !isDigest(n));
    children.splice(0, children.length, ...kept);
    // 見出しの下に篇が一つしかなければ、見出しの階層は作らない（法言の「序」）
    if (children.length === 1) part.title = "";
    if (part.title) root.children.push({ title: part.title, body: "", children });
    else root.children.push(...children);
  }
  return root;
}

function dropParagraphs(node: SectionNode, drop: string[]): SectionNode {
  return {
    ...node,
    body: node.body
      .split("\n\n")
      .filter((p) => !drop.includes(p.trim()))
      .join("\n\n"),
    children: node.children.map((c) => dropParagraphs(c, drop)),
  };
}

/** 他の版本への案内など、本文ではない節や段落の目印 */
const NON_TEXT_SECTIONS = ["他本", "其他版本", "其它版本", "注釋本"];
const NON_TEXT_PARAGRAPH = /^(参见|參見)[：:]/;

function dropNonText(node: SectionNode): SectionNode {
  return {
    ...node,
    body: node.body
      .split("\n\n")
      .filter((p) => !NON_TEXT_PARAGRAPH.test(p.trim()))
      .join("\n\n"),
    children: node.children
      .filter((c) => !NON_TEXT_SECTIONS.includes(c.title))
      .map(dropNonText),
  };
}

function prune(node: SectionNode): SectionNode | undefined {
  const children = node.children.map(prune).filter((c): c is SectionNode => !!c);
  if (!node.body.trim() && children.length === 0) return undefined;
  return { ...node, children };
}

function save(book: BookConfig & { category: string }, position: number, tree: SectionNode) {
  const db = getDb();
  const insertBook = db.prepare(`
    INSERT INTO books (slug, title, author, era, category, description, spine_color, position,
                       source_name, source_url, license, imported_at)
    VALUES (@slug, @title, @author, @era, @category, @description, @spineColor, @position,
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
    // 前置き (序など見出しのない冒頭部分) は「卷首」として先頭に置く。見出しが一つもなければ「全文」
    // 書名が書いてあるだけの前置きは章にしない
    const leadTitle = tree.children.length > 0 ? "卷首" : "全文";
    const lead = tree.body.trim();
    if (lead && lead !== book.title) walk({ title: leadTitle, body: tree.body, children: [] }, null, 0);
    for (const child of tree.children) walk(child, null, 0);
  })();
  return count;
}

async function main() {
  const only = process.argv.slice(2);
  const failed: string[] = [];
  for (const [i, book] of BOOKS.entries()) {
    if (only.length && !only.includes(book.slug)) continue;
    console.log(`${book.title} (${book.page})`);
    try {
      let tree = dropNonText(await buildTree(book));
      if (book.dropParagraphs) tree = dropParagraphs(tree, book.dropParagraphs);
      const count = save(book, i, prune(tree) ?? { title: "", body: "", children: [] });
      console.log(`  → ${count} セクションを保存`);
    } catch (err) {
      // 一冊が失敗しても、残りの本の取り込みは続ける
      console.error(`  × ${err instanceof Error ? err.message : err}`);
      failed.push(book.slug);
    }
  }
  if (failed.length) {
    console.error(`取り込めなかった本: ${failed.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

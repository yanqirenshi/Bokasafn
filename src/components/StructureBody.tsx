import Link from "next/link";
import type { ReactNode } from "react";
import type { Sentence, StructureNode } from "@/lib/structure";
import styles from "./StructureBody.module.css";

type TableNode = Extract<StructureNode, { type: "table" }>;

/**
 * センテンスをつなげて見せる。センテンスが本文の正本なので、区切りは足さない。
 * 文を指して注を付けられるように、センテンスごとに ID を持たせる。
 */
function Sentences({ sentences }: { sentences: Sentence[] }) {
  return sentences.map((s) => (
    <span key={s.id} data-sentence={s.id}>
      {s.text}
    </span>
  ));
}

function Table({ node }: { node: TableNode }) {
  const rows = Array.from({ length: node.n_row }, (_, r) =>
    node.cells.filter((c) => c.row === r).sort((a, b) => a.col - b.col),
  );
  return (
    <div className={styles.tableWrap} id={node.id}>
      <table className={styles.table}>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r}>
              {cells.map((c) => (
                <td key={c.col} rowSpan={c.row_span} colSpan={c.col_span}>
                  {c.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 図の画像の URL。src は本のフォルダからの相対パスで、figures/ の下だけを出す */
function figureUrl(slug: string, src: string): string | undefined {
  const prefix = "figures/";
  if (!src.startsWith(prefix)) return undefined;
  const rest = src.slice(prefix.length).split("/").map(encodeURIComponent).join("/");
  return `/books/${slug}/figures/${rest}`;
}

/**
 * 本文の要素を描く。
 * headingLevel は、最初に出てくるセクションの見出しの段（2 なら h2）。入れ子になるごとに 1 つ下がる。
 */
export function StructureBody({
  slug,
  nodes,
  headingLevel = 2,
}: {
  slug: string;
  nodes: StructureNode[];
  headingLevel?: number;
}): ReactNode {
  return nodes.map((node) => {
    switch (node.type) {
      case "section": {
        const Heading = `h${Math.min(headingLevel, 6)}` as "h2" | "h3" | "h4" | "h5" | "h6";
        return (
          <section key={node.id} id={node.id} className={styles.section}>
            <Heading className={styles.heading}>{node.title}</Heading>
            <StructureBody slug={slug} nodes={node.children} headingLevel={headingLevel + 1} />
          </section>
        );
      }
      case "section_ref":
        // 別のページに分かれた子のセクション
        return (
          <p key={node.id} className={styles.ref}>
            <Link href={`/books/${slug}/${encodeURIComponent(node.id)}`}>{node.title}</Link>
          </p>
        );
      case "paragraph":
        return (
          <p key={node.id} id={node.id}>
            <Sentences sentences={node.sentences} />
          </p>
        );
      case "list":
        return (
          <ul key={node.id} id={node.id} className={styles.list}>
            {node.items.map((item) => (
              <li key={item.id} id={item.id}>
                <Sentences sentences={item.sentences} />
              </li>
            ))}
          </ul>
        );
      case "figure": {
        const text = Array.isArray(node.text) ? node.text.join(" ") : node.text;
        const url = node.src ? figureUrl(slug, node.src) : undefined;
        return (
          <figure key={node.id} id={node.id} className={styles.figure}>
            {url ? (
              // 本のフォルダの画像を、そのままの大きさで出す（大きさは事前に分からない）
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={text || "本文の図"} loading="lazy" />
            ) : (
              <p className={styles.figureText}>{text}</p>
            )}
          </figure>
        );
      }
      case "caption":
        return (
          <p key={node.id} id={node.id} className={styles.caption}>
            {node.text}
          </p>
        );
      case "table":
        return <Table key={node.id} node={node} />;
      default:
        // 知らない種類の要素は描かない（形式が広がっても、画面を止めない）
        return null;
    }
  });
}

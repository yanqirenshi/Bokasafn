import { getBook } from "@/lib/books";
import { readFigure } from "@/lib/structure";

/**
 * 本文の図の画像。本のフォルダの figures/ から読んで返す。
 * figures/ の外を指すパスや、画像でないファイルは 404 にする（readFigure が確かめる）。
 */
export async function GET(_request: Request, ctx: RouteContext<"/books/[slug]/figures/[...path]">) {
  const { slug, path } = await ctx.params;
  const book = await getBook(slug);
  const figure = book && readFigure(book.folder, path);
  if (!figure) return new Response("Not Found", { status: 404 });
  return new Response(new Uint8Array(figure.data), {
    headers: {
      "Content-Type": figure.contentType,
      // 画像は版を作り直しても同じ名前で残るので、短い時間だけ覚えさせる
      "Cache-Control": "private, max-age=300",
    },
  });
}

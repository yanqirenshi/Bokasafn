// 著者の文字列（「託名 黃帝・岐伯」「戴聖 編」など）と、著者ごとの役割との変換。
// 取り込みスクリプト・DB の移行・画面の表示で共通に使う。

/** 本に対する著者の関わり方 */
export type AuthorRole = "著" | "編" | "注" | "託名";

export type AuthorCredit = { name: string; role: AuthorRole };

/**
 * 著者の文字列を、著者ごとの名前と役割に分ける。
 * - 「張仲景」→ 著
 * - 「託名 黃帝・岐伯」→ 黃帝・岐伯 とも 託名
 * - 「戴聖 編」「王肅 注」→ 編・注
 * - 以前の書き方「佚名（託名 神農）」は「託名 神農」として読む
 */
export function parseAuthors(text: string | null | undefined): AuthorCredit[] {
  let rest = (text ?? "").trim();
  const anonymous = rest.match(/^佚名（(.*)）$/u);
  if (anonymous) rest = anonymous[1].trim();
  if (!rest || rest === "佚名") return [];

  let role: AuthorRole = "著";
  if (rest.startsWith("託名 ")) {
    role = "託名";
    rest = rest.slice("託名 ".length);
  } else if (/ (編|注)$/u.test(rest)) {
    role = rest.slice(-1) as AuthorRole;
    rest = rest.slice(0, -2);
  }
  return rest
    .split("・")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, role }));
}

/** 著者ごとの名前と役割を、表示用の一つの文字列にする（parseAuthors の逆） */
export function formatAuthors(credits: AuthorCredit[]): string {
  const groups: { role: AuthorRole; names: string[] }[] = [];
  for (const { name, role } of credits) {
    const last = groups.at(-1);
    if (last?.role === role) last.names.push(name);
    else groups.push({ role, names: [name] });
  }
  return groups
    .map(({ role, names }) => {
      const joined = names.join("・");
      if (role === "託名") return `託名 ${joined}`;
      if (role === "編" || role === "注") return `${joined} ${role}`;
      return joined;
    })
    .join("、");
}

// 画面遷移図 (d3.sitemap) に使うコレクション。
export const SITEMAP_COLLECTIONS = [
    'sitemap/nodes',
    'sitemap/edges',
];

// d3.sitemap に渡すデータを作る。
// d3.sitemap はデータを書き換えるので、複製して渡す。
export function buildSitemapData (collections) {
    return structuredClone({
        nodes: collections['sitemap/nodes'],
        edges: collections['sitemap/edges'],
    });
}

// TM (d3.ter) に使うコレクション。
export const TM_COLLECTIONS = [
    'tm/identifiers',
    'tm/attributes',
    'tm/entities',
    'tm/relationships',
];

// d3.ter に渡すデータ一式を作る。
// d3.ter はデータを書き換えるので、複製して渡す。
export function buildTmData (collections) {
    return structuredClone({
        identifiers:   collections['tm/identifiers'],
        attributes:    collections['tm/attributes'],
        entities:      collections['tm/entities'],
        relationships: collections['tm/relationships'],
    });
}

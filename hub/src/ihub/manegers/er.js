// ER 図 (d3.er) に使うコレクション。
export const ER_COLLECTIONS = [
    'er/entities',
    'er/columns',
    'er/column_instances',
    'er/ports',
    'er/relationships',
];

// d3.er は、テーブルの位置と大きさを x/y/z と w/h で読む。
// データは position と size で持っているので、写しておく。
function table2d3er (table) {
    return {
        ...table,
        x: table.position.x,
        y: table.position.y,
        z: table.position.z,
        w: table.size.w,
        h: table.size.h,
    };
}

// d3.er に渡すデータ (TABLES/COLUMNS/... のフラットな形式) を作る。
// d3.er はデータを書き換えるので、複製して渡す。
export function buildErData (collections) {
    return structuredClone({
        TABLES:           collections['er/entities'].map(table2d3er),
        COLUMNS:          collections['er/columns'],
        COLUMN_INSTANCES: collections['er/column_instances'],
        RELASHONSHIPS:    collections['er/relationships'],
        PORTS:            collections['er/ports'],
    });
}

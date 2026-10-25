// ドメインごとの、コレクションをまたぐ検査 (id の重複・参照の整合性)。
// 関数の引数はドメインのコレクション ({ entities: [...], ... })、戻り値はエラーのメッセージの配列。
// スキーマに合っているデータだけを渡す。

// list の中で key の値が重複していれば、エラーにする。値の集合を返す。
function checkUnique (errors, label, list, key = 'id') {
    const values = new Set();

    for (const d of list) {
        if (values.has(d[key]))
            errors.push(`${label}: ${key} が重複しています。(${key}=${d[key]})`);

        values.add(d[key]);
    }

    return values;
}

// 入れ子のノード (children) を平らにする。
export function flatten (nodes) {
    return nodes.flatMap(node=> [node, ...flatten(node.children || [])]);
}

function checkWbs ({ projects, wbs, workpackages }) {
    const errors = [];

    // id は、プロジェクト・WBS・ワークパッケージをまたいで一意にする。(URL とページのファイル名に使うため)
    checkUnique(errors, 'wbs', [...projects, ...wbs, ...workpackages]);

    const parents = new Set([...projects, ...wbs].map(d=> d.id));

    for (const d of wbs)
        if (!parents.has(d.parent))
            errors.push(`wbs/wbs: parent のプロジェクトか WBS が見つかりません。(id=${d.id}, parent=${d.parent})`);

    const wbs_ids = new Set(wbs.map(d=> d.id));

    for (const d of workpackages)
        if (!wbs_ids.has(d.parent))
            errors.push(`wbs/workpackages: parent の WBS が見つかりません。(id=${d.id}, parent=${d.parent})`);

    return errors;
}

// ER の _class と、そのデータを置くコレクション。
const ER_CLASS_COLLECTIONS = {
    'TABLE':           'entities',
    'COLUMN':          'columns',
    'COLUMN-INSTANCE': 'column_instances',
    'PORT-ER-OUT':     'ports',
    'PORT-ER-IN':      'ports',
};

function checkEr (er) {
    const errors = [];

    for (const collection of ['entities', 'columns', 'column_instances', 'ports', 'relationships'])
        checkUnique(errors, `er/${collection}`, er[collection], '_id');

    // relationships の端点は、_class と _id の組で指す。
    const keys = new Set();

    for (const collection of new Set(Object.values(ER_CLASS_COLLECTIONS)))
        for (const d of er[collection])
            keys.add(`${d._class}:${d._id}`);

    for (const r of er.relationships)
        for (const end of ['from', 'to'])
            if (!keys.has(`${r[end + '_class']}:${r[end + '_id']}`))
                errors.push(`er/relationships: ${end} の ${r[end + '_class']} が見つかりません。(_id=${r._id}, ${end}_id=${r[end + '_id']})`);

    return errors;
}

function checkTm ({ identifiers, attributes, entities, relationships }) {
    const errors = [];

    const identifier_ids = checkUnique(errors, 'tm/identifiers', identifiers);
    const attribute_ids  = checkUnique(errors, 'tm/attributes', attributes);

    checkUnique(errors, 'tm/entities', entities);
    checkUnique(errors, 'tm/relationships', relationships);

    // エンティティが持つ識別子・属性のインスタンスの id は、エンティティをまたいで一意にする。
    // (d3.ter は、インスタンスを id だけで探すため)
    checkUnique(errors, 'tm/entities の identifiers・attributes', entities.flatMap(e=> [...e.identifiers, ...e.attributes]));

    for (const e of entities) {
        for (const d of e.identifiers)
            if (!identifier_ids.has(d.identifier))
                errors.push(`tm/entities: identifier が identifiers に見つかりません。(entity=${e.id}, id=${d.id}, identifier=${d.identifier})`);

        for (const d of e.attributes)
            if (!attribute_ids.has(d.attribute))
                errors.push(`tm/entities: attribute が attributes に見つかりません。(entity=${e.id}, id=${d.id}, attribute=${d.attribute})`);
    }

    const index = new Map(entities.map(e=> [e.id, e]));

    for (const r of relationships) {
        for (const end of ['from', 'to']) {
            const entity = index.get(r[end].entity);

            if (!entity) {
                errors.push(`tm/relationships: ${end}.entity のエンティティが見つかりません。(id=${r.id}, entity=${r[end].entity})`);
                continue;
            }

            if (r[end].id !== undefined && !entity.identifiers.some(d=> d.id===r[end].id))
                errors.push(`tm/relationships: ${end}.id がエンティティの識別子に見つかりません。(id=${r.id}, entity=${entity.id}, ${end}.id=${r[end].id})`);

            for (const detail of r.details || []) {
                const instances = [...entity.identifiers, ...entity.attributes];

                if (!instances.some(d=> d.id===detail[end].id))
                    errors.push(`tm/relationships: details の ${end}.id がエンティティの識別子・属性に見つかりません。(id=${r.id}, entity=${entity.id}, ${end}.id=${detail[end].id})`);
            }
        }

        if (r.mapping && !index.has(r.mapping.entity))
            errors.push(`tm/relationships: mapping.entity のエンティティが見つかりません。(id=${r.id}, entity=${r.mapping.entity})`);
    }

    return errors;
}

// ノードと線の図 (画面遷移図・システム構成図)。
function checkGraph (domain, { nodes, edges }) {
    const errors = [];

    const node_ids = checkUnique(errors, `${domain}/nodes`, flatten(nodes));

    checkUnique(errors, `${domain}/edges`, edges);

    for (const edge of edges)
        for (const end of ['from', 'to'])
            if (!node_ids.has(edge[end].id))
                errors.push(`${domain}/edges: ${end}.id のノードが見つかりません。(id=${edge.id}, ${end}.id=${edge[end].id})`);

    return errors;
}

export const RULES = {
    wbs:        checkWbs,
    er:         checkEr,
    tm:         checkTm,
    sitemap:    (data)=> checkGraph('sitemap', data),
    deployment: (data)=> checkGraph('deployment', data),
};

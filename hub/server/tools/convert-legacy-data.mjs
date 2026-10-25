// 古い形式のデータ (src/data/*.js) を、新しい形式 (data/{domain}/{collection}.json) に変換する。
// iHub をコピーしたアプリを、データが src/data/*.js だったころ (yanqirenshi/iHub#21 より前) から移すときに使う。
//
// 使い方: node server/tools/convert-legacy-data.mjs <古い src/data のフォルダ> <書き出し先の data フォルダ> [--force]
// 例:     node server/tools/convert-legacy-data.mjs src/data data
//
// 書き出し先に同じ名前のファイルがあるときは、何も書かずに止める。(--force を付けると上書きする)
// src/data/ の ACCOUNT_MENUS.js・ICONS.js・OPERATOR_ITEMS.js は変換しない。(src/config/ に移す)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2).filter(a=> a!=='--force');
const force = process.argv.includes('--force');

if (args.length!==2) {
    console.error('使い方: node server/tools/convert-legacy-data.mjs <古い src/data のフォルダ> <書き出し先の data フォルダ> [--force]');
    process.exit(1);
}

const src = resolve(args[0]);
const out = resolve(args[1]);

const load = async (rel)=> (await import(pathToFileURL(join(src, rel)).href)).default;

// システム構成図のノード: id を先頭に並べ、値の無い link (null) は書かない。
function deploymentNode (d) {
    const { id, children, link, ...rest } = d;
    const o = { id, ...rest };
    if (link) o.link = link;
    if (children) o.children = children.map(deploymentNode);
    return o;
}

const tm = await load('TM.js');

// 書き出すファイルと、その中身。
const files = {
    'deployment/nodes.json': (await load('DEPLOYMENT_MANAGE_OVERVIEW_NODE_DATA.js')).map(deploymentNode),
    'deployment/edges.json': await load('DEPLOYMENT_MANAGE_OVERVIEW_EDGE_DATA.js'),

    // ER 図のテーブルは、位置と大きさをまとめる。
    'er/entities.json': (await load('ER_DATA/ENTITIES.js')).map(d=> ({
        _id: d._id, code: d.code, name: d.name, description: d.description, _class: d._class,
        position: { x: d.x, y: d.y, z: d.z }, size: { w: d.w, h: d.h },
    })),
    'er/columns.json':          await load('ER_DATA/COLUMNS.js'),
    'er/column_instances.json': await load('ER_DATA/COLUMN_INSTANCES.js'),
    'er/ports.json':            await load('ER_DATA/PORTS.js'),
    'er/relationships.json': (await load('ER_DATA/RELASHONSHIPS.js')).map(d=> ({
        _id: d._id, _class: d._class, from_id: d.from_id, from_class: d.from_class,
        to_id: d.to_id, to_class: d.to_class, data_type: d.data_type, hide: d.hide,
    })),

    // 画面のノードは配列にし、画面の遷移には id を振る。
    'sitemap/nodes.json': Object.values(await load('SITEMAP_DATA/SITEMAP_DATA_NODES.js')),
    'sitemap/edges.json': (await load('SITEMAP_DATA/SITEMAP_DATA_EDGES.js')).map((d, i)=> ({ id: 2000001 + i, ...d })),

    'systemic_design/sections.json': await load('systemic_design/DATA.js'),

    'tm/identifiers.json':   tm.identifiers,
    'tm/attributes.json':    tm.attributes,
    'tm/entities.json':      tm.entities,
    'tm/relationships.json': tm.relationships,

    // ワークパッケージの _class は、画面が読み込むときに付ける。
    'wbs/projects.json':     await load('WBS/PROJECTS.js'),
    'wbs/wbs.json':          await load('WBS/WBS.js'),
    'wbs/workpackages.json': (await load('WBS/WORKPACKAGES.js')).map(({ _class, ...d })=> d),
};

const exists = Object.keys(files).filter(rel=> existsSync(join(out, rel)));

if (exists.length > 0 && !force) {
    console.error('書き出し先に、同じ名前のファイルがあります。上書きするときは --force を付けてください。');
    exists.forEach(rel=> console.error('  ' + join(out, rel)));
    process.exit(1);
}

// API サーバーと同じ書き方 (4 つの空白で字下げし、最後に改行) で書く。
for (const [rel, data] of Object.entries(files)) {
    const file = join(out, rel);

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 4) + '\n', 'utf8');
}

console.log(`${Object.keys(files).length} 個のファイルに変換しました: ${out}`);
console.log('npm run test:data で、フォーマットに合っているかを確かめてください。');

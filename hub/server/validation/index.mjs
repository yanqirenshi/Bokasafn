// data フォルダ (data/ など) を、JSON Schema とドメインごとのルールで検証する。
// コレクションは server/schemas/{domain}/{collection}.schema.json と
// data フォルダの {domain}/{collection}.json の組で、スキーマのファイルから一覧を作る。
// domain が local のコレクションは個人の設定なので、ファイルが無くてもよい。(無いときはスキーマの default を使う)
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import localize from 'ajv-i18n';

import { RULES } from './rules.mjs';

const SCHEMAS_DIR = fileURLToPath(new URL('../schemas/', import.meta.url));

// dir の下で suffix で終わるファイルを、dir からの相対パス (区切りは /) で返す。
function listFiles (dir, suffix) {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(d=> d.isFile() && d.name.endsWith(suffix))
        .map(d=> relative(dir, join(d.parentPath, d.name)).split(sep).join('/'))
        .sort();
}

// 配列のコレクションの、レコードのプロパティ。
function itemProperties (schema) {
    let items = schema.items;

    if (items && items.$ref && items.$ref.startsWith('#/$defs/'))
        items = schema.$defs[items.$ref.slice('#/$defs/'.length)];

    return (items && items.properties) || {};
}

export const COLLECTIONS = listFiles(SCHEMAS_DIR, '.schema.json').map(file=> {
    const name = file.slice(0, -'.schema.json'.length);
    const [domain, collection] = name.split('/');
    const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, file), 'utf8'));
    const properties = schema.type==='array' ? itemProperties(schema) : {};

    return {
        name,
        domain,
        collection,
        schema,
        optional: domain==='local',
        // レコードの id のプロパティ。(id の無いコレクションは null)
        idKey: '_id' in properties ? '_id' : ('id' in properties ? 'id' : null),
        // コレクションが空のときに、最初に振る id。
        idStart: schema['x-id-start'] || 1,
    };
});

export function findCollection (name) {
    return COLLECTIONS.find(c=> c.name===name) || null;
}

// ファイルが無いときに使うデータ。
export function defaultData (collection) {
    return structuredClone(collection.schema.default);
}

const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });

// 採番に使う注釈。(検証には使わない)
ajv.addKeyword({ keyword: 'x-id-start', schemaType: 'number' });

const VALIDATORS = Object.fromEntries(COLLECTIONS.map(c=> [c.name, ajv.compile(c.schema)]));

function formatError (name, error) {
    const params = error.params || {};

    let detail = '';
    if (params.additionalProperty) detail = ` (${params.additionalProperty})`;
    if (params.allowedValues)      detail = ` (${params.allowedValues.join(', ')})`;

    return `${name}${error.instancePath}: ${error.message}${detail}`;
}

// data フォルダの JSON を読み込む。戻り値は { 'er/entities': [...], ... }。
export function loadDataDir (dir) {
    return Object.fromEntries(listFiles(dir, '.json').map(file=> {
        const name = file.slice(0, -'.json'.length);

        try {
            return [name, JSON.parse(readFileSync(join(dir, file), 'utf8'))];
        } catch (e) {
            throw new Error(`${name}: JSON として読めません。${e.message}`);
        }
    }));
}

// collections をスキーマで検証し、そろっていてスキーマに合っているドメインはルールでも検査する。
function validateCollections (collections, data) {
    const errors = [];
    const invalid = new Set();

    for (const c of collections) {
        if (!(c.name in data)) {
            if (!c.optional) {
                errors.push(`${c.name}: ファイルがありません。`);
                invalid.add(c.name);
            }
            continue;
        }

        const validate = VALIDATORS[c.name];

        if (!validate(data[c.name])) {
            localize.ja(validate.errors);
            errors.push(...validate.errors.map(e=> formatError(c.name, e)));
            invalid.add(c.name);
        }
    }

    const domains = new Set(collections.map(c=> c.domain));

    for (const [domain, check] of Object.entries(RULES)) {
        if (!domains.has(domain))
            continue;

        const members = COLLECTIONS.filter(c=> c.domain===domain);

        if (members.some(c=> invalid.has(c.name)))
            continue;

        errors.push(...check(Object.fromEntries(members.map(c=> [c.collection, data[c.name]]))));
    }

    return errors;
}

// 読み込んだデータ全体を検証する。戻り値はエラーのメッセージの配列。(空ならエラーなし)
export function validateData (data) {
    const errors = validateCollections(COLLECTIONS, data);

    for (const name of Object.keys(data))
        if (!findCollection(name))
            errors.push(`${name}: スキーマがありません。(server/schemas/${name}.schema.json を作ってください)`);

    return errors;
}

// 1 つのドメインのデータだけを検証する。(API サーバーが、書き込む前に使う)
export function validateDomain (domain, data) {
    return validateCollections(COLLECTIONS.filter(c=> c.domain===domain), data);
}

export function validateDataDir (dir) {
    return validateData(loadDataDir(dir));
}

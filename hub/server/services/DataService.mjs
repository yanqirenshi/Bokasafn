// コレクションの読み書きの手順。
// 書き込みは 1 つずつ順に行い、書く前にドメインのデータ全体をスキーマとルールで検証する。
import { COLLECTIONS, defaultData, findCollection, validateDomain } from '../validation/index.mjs';
import { flatten } from '../validation/rules.mjs';
import { etagOf } from '../stores/FileStore.mjs';

export class HttpError extends Error {
    constructor (status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

function isObject (v) {
    return v!==null && typeof v==='object' && !Array.isArray(v);
}

// JSON Merge Patch (RFC 7396)。null を指定した項目は消す。
function mergePatch (target, patch) {
    if (!isObject(patch))
        return patch;

    const out = isObject(target) ? { ...target } : {};

    for (const [key, value] of Object.entries(patch)) {
        if (value===null)
            delete out[key];
        else
            out[key] = mergePatch(out[key], value);
    }

    return out;
}

// レコードを id で探す。入れ子のノード (children) の中も探す。
function findRecord (list, key, id) {
    for (let index = 0; index < list.length; index++) {
        if (list[index][key]===id)
            return { list, index };

        const found = findRecord(list[index].children || [], key, id);

        if (found)
            return found;
    }

    return null;
}

// 新しい id を振る。
// コレクションの最大の id + 1 (空のときは x-id-start) から、ドメインの中で使われていない id まで進める。
function allocateId (collection, domain) {
    const used = new Set();

    for (const c of COLLECTIONS.filter(d=> d.domain===collection.domain && d.idKey))
        for (const record of flatten(domain[c.name]))
            used.add(record[c.idKey]);

    const own = flatten(domain[collection.name])
        .map(record=> record[collection.idKey])
        .filter(Number.isInteger);

    let id = own.length > 0 ? Math.max(...own) + 1 : collection.idStart;

    while (used.has(id))
        id++;

    return id;
}

function recordKey (collection) {
    if (!collection.idKey)
        throw new HttpError(400, `${collection.name} は、レコードごとには変更できません。PUT でコレクション全体を書き換えてください。`);

    return collection.idKey;
}

function assertObject (value, label) {
    if (!isObject(value))
        throw new HttpError(400, `${label}は、JSON のオブジェクトで指定してください。`);
}

export default class DataService {
    constructor (store) {
        this.store = store;
        this.queue = Promise.resolve();
        // 変更を知らせる先 (画面への通知)
        this.listeners = new Set();
        // コレクションごとに、最後に知らせた ETag (同じ内容を何度も知らせないため)
        this.etags = new Map();
    }

    // 変更の通知を受け取る。戻り値は、受け取りをやめる関数。
    subscribe (listener) {
        this.listeners.add(listener);

        return ()=> this.listeners.delete(listener);
    }

    notify (event) {
        for (const listener of this.listeners)
            listener(event);
    }

    // ファイルが API の外 (エディタや git) で変わったときに呼ぶ。
    // 検証して、合っていれば changed、合っていなければ invalid を知らせる。
    changed (name) {
        const collection = findCollection(name);

        if (!collection)
            return Promise.resolve();

        return this.exclusive(async ()=> {
            let domain;

            try {
                domain = await this.loadDomain(collection.domain);
            } catch (e) {
                return this.notify({ type: 'invalid', name, errors: [e.message] });
            }

            const etag = etagOf(domain[name]);

            if (this.etags.get(name)===etag)
                return;

            this.etags.set(name, etag);

            const errors = validateDomain(collection.domain, domain);

            if (errors.length > 0)
                return this.notify({ type: 'invalid', name, errors });

            this.notify({ type: 'changed', name, etag, client: null });
        });
    }

    collection (name) {
        const collection = findCollection(name);

        if (!collection)
            throw new HttpError(404, `コレクションがありません。(${name})`);

        return collection;
    }

    async load (collection) {
        const data = await this.store.read(collection.name);

        if (data!==undefined)
            return data;

        if (collection.optional)
            return defaultData(collection);

        throw new HttpError(404, `データのファイルがありません。(data/${collection.name}.json)`);
    }

    async loadDomain (domain) {
        const data = {};

        for (const c of COLLECTIONS.filter(d=> d.domain===domain))
            data[c.name] = await this.load(c);

        return data;
    }

    async readAll () {
        const collections = {};
        const etags = {};

        for (const c of COLLECTIONS) {
            collections[c.name] = await this.load(c);
            etags[c.name] = etagOf(collections[c.name]);
        }

        return { collections, etags };
    }

    async read (name) {
        const data = await this.load(this.collection(name));

        return { name, data, etag: etagOf(data) };
    }

    // 書き込みを 1 つずつ順に実行する。
    exclusive (fn) {
        const run = this.queue.then(()=> fn(), ()=> fn());

        this.queue = run.catch(()=> {});

        return run;
    }

    // コレクションを書き換える共通の手順。
    // options は { if_match: 読み込んだときの ETag, client: 書き込んだ画面 (タブ) の id }。
    // change は (コレクション, 今のデータの複製, ドメインのデータ) を受け取り、{ data, record, conflict } を返す。
    update (name, options, required, change) {
        const collection = this.collection(name);
        const { if_match = null, client = null } = options;

        return this.exclusive(async ()=> {
            const domain = await this.loadDomain(collection.domain);
            const current = domain[collection.name];

            if (required && !if_match)
                throw new HttpError(428, 'If-Match ヘッダーに、読み込んだときの ETag を指定してください。');

            if (if_match && if_match!=='*' && if_match!==etagOf(current))
                throw new HttpError(412, '読み込んだあとに、ほかで変更されています。読み込み直してください。');

            const { data, record, conflict } = change(collection, structuredClone(current), domain);

            // もともとあったエラーは除いて、この変更で増えたエラーだけを見る。
            const before = new Set(validateDomain(collection.domain, domain));
            const errors = validateDomain(collection.domain, { ...domain, [collection.name]: data })
                  .filter(e=> !before.has(e));

            if (errors.length > 0) {
                if (conflict)
                    throw new HttpError(409, 'ほかのデータから参照されているため、削除できません。', errors);

                throw new HttpError(400, 'データがフォーマットやルールに合っていません。', errors);
            }

            await this.store.write(collection.name, data);

            const etag = etagOf(data);

            // ファイルの見張りからの知らせと重ならないように、知らせた ETag を覚えておく。
            this.etags.set(collection.name, etag);
            this.notify({ type: 'changed', name: collection.name, etag, client });

            return { name: collection.name, data, etag, ...(record ? { record } : {}) };
        });
    }

    // コレクション全体を書き換える。(上書きを防ぐため、If-Match を必ず指定する)
    replace (name, body, options = {}) {
        return this.update(name, options, true, ()=> ({ data: body }));
    }

    // オブジェクトのコレクションを、JSON Merge Patch で部分的に書き換える。
    patchDocument (name, patch, options = {}) {
        return this.update(name, options, false, (collection, current)=> {
            if (!isObject(current))
                throw new HttpError(400, `${collection.name} は配列なので、レコードごとに PATCH してください。`);

            assertObject(patch, '変更する内容');

            return { data: mergePatch(current, patch) };
        });
    }

    // レコードを追加する。id が無ければ振る。
    addRecord (name, body, options = {}) {
        return this.update(name, options, false, (collection, current, domain)=> {
            const key = recordKey(collection);

            assertObject(body, '追加するレコード');

            const record = body[key]===undefined ? { [key]: allocateId(collection, domain), ...body } : body;

            current.push(record);

            return { data: current, record };
        });
    }

    // レコードを、JSON Merge Patch で部分的に書き換える。
    patchRecord (name, id, patch, options = {}) {
        return this.update(name, options, false, (collection, current)=> {
            const key = recordKey(collection);

            assertObject(patch, '変更する内容');

            if (key in patch && patch[key]!==id)
                throw new HttpError(400, `${key} は変更できません。`);

            const found = findRecord(current, key, id);

            if (!found)
                throw new HttpError(404, `レコードがありません。(${collection.name}, ${key}=${id})`);

            const record = mergePatch(found.list[found.index], patch);

            found.list[found.index] = record;

            return { data: current, record };
        });
    }

    // レコードを削除する。ほかのデータから参照されていれば、409 にする。
    deleteRecord (name, id, options = {}) {
        return this.update(name, options, false, (collection, current)=> {
            const key = recordKey(collection);
            const found = findRecord(current, key, id);

            if (!found)
                throw new HttpError(404, `レコードがありません。(${collection.name}, ${key}=${id})`);

            const [record] = found.list.splice(found.index, 1);

            return { data: current, record, conflict: true };
        });
    }
}

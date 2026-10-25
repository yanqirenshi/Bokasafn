import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from '../app.mjs';

const EXAMPLE = fileURLToPath(new URL('../../src/ihub/data_example/', import.meta.url));

let dir;
let app;

// テストごとに、雛形のデータを一時フォルダへ複製して使う。
beforeEach(()=> {
    dir = mkdtempSync(join(tmpdir(), 'ihub-api-'));
    cpSync(EXAMPLE, dir, { recursive: true });
    app = createApp({ data_dir: dir });
});

afterEach(()=> {
    app.stopWatching?.();
});

// SSE (GET /api/events) の応答から、通知を 1 つずつ取り出す。
function eventReader (res) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let pending = null;

    // 待ち切れなかった読み込みは、次に使う。(届いた内容をなくさないため)
    const read = ()=> pending ??= reader.read().then(result=> {
        pending = null;
        return result;
    });

    return {
        async next (ms = 3000) {
            const deadline = Date.now() + ms;

            for (;;) {
                const index = buffer.indexOf('\n\n');

                if (index >= 0) {
                    const chunk = buffer.slice(0, index);

                    buffer = buffer.slice(index + 2);

                    // ping などのコメントは飛ばす。
                    if (!/^event: /m.test(chunk))
                        continue;

                    return JSON.parse(chunk.split('\n')
                                      .filter(line=> line.startsWith('data: '))
                                      .map(line=> line.slice('data: '.length))
                                      .join('\n'));
                }

                const rest = deadline - Date.now();

                if (rest <= 0)
                    throw new Error('通知が届きませんでした。');

                let timer;
                const result = await Promise.race([read(), new Promise(resolve=> { timer = setTimeout(()=> resolve(null), rest); })]);

                clearTimeout(timer);

                if (result && result.done)
                    throw new Error('通知の接続が切れました。');

                if (result)
                    buffer += decoder.decode(result.value, { stream: true });
            }
        },
        close: ()=> reader.cancel(),
    };
}

function request (path, { method = 'GET', body, headers = {} } = {}) {
    return app.request(path, {
        method,
        headers: {
            host: 'localhost:3000',
            ...(body!==undefined ? { 'content-type': 'application/json' } : {}),
            ...headers,
        },
        body: body!==undefined ? JSON.stringify(body) : undefined,
    });
}

function readData (name) {
    return JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
}

test('GET /api/data で、全データと ETag を返す', async ()=> {
    const res = await request('/api/data');
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(json.collections['er/entities']));
    assert.deepEqual(json.collections['local/account_menus'], {});
    assert.match(json.etags['er/entities'], /^"[0-9a-f]{40}"$/);
});

test('GET でコレクションを返し、無いコレクションは 404 にする', async ()=> {
    const res = await request('/api/er/entities');
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('etag'), json.etag);
    assert.deepEqual(json.data, readData('er/entities'));

    const missing = await request('/api/er/unknown');

    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).message, 'コレクションがありません。(er/unknown)');
});

test('PUT は If-Match を確かめ、検証してから書き込む', async ()=> {
    const { data, etag } = await (await request('/api/er/entities')).json();

    assert.equal((await request('/api/er/entities', { method: 'PUT', body: data })).status, 428);
    assert.equal((await request('/api/er/entities', { method: 'PUT', body: data, headers: { 'if-match': '"x"' } })).status, 412);

    const broken = structuredClone(data);
    delete broken[0].size;

    const invalid = await request('/api/er/entities', { method: 'PUT', body: broken, headers: { 'if-match': etag } });

    assert.equal(invalid.status, 400);
    assert.deepEqual((await invalid.json()).errors, ['er/entities/0: 必要なプロパティsizeがなければいけない']);

    const changed = structuredClone(data);
    changed[0].name = 'テーブル B';

    const res = await request('/api/er/entities', { method: 'PUT', body: changed, headers: { 'if-match': etag } });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.notEqual(json.etag, etag);
    assert.equal(readData('er/entities')[0].name, 'テーブル B');
});

test('POST で id を振ってレコードを追加する', async ()=> {
    // WBS は、コレクションの最大の id + 1。空のコレクションは x-id-start から。
    const wbs = await request('/api/wbs/wbs', { method: 'POST', body: { parent: 1, name: '新しい WBS' } });

    assert.equal(wbs.status, 201);
    assert.deepEqual((await wbs.json()).record, { id: 1030, parent: 1, name: '新しい WBS' });

    const wp = await request('/api/wbs/workpackages', { method: 'POST', body: { parent: 1030, name: 'WP' } });

    assert.equal((await wp.json()).record.id, 1000000);
    assert.equal(readData('wbs/workpackages').length, 1);

    // ER のテーブル・カラムなどは、ドメインの中で使われていない id にする。
    const table = await request('/api/er/entities', {
        method: 'POST',
        body: { code: 'TABLE-C', name: 'Table C', _class: 'TABLE', position: { x: 0, y: 0 }, size: { w: 100, h: 100 } },
    });

    assert.equal((await table.json()).record._id, 16);
});

test('POST でルールに合わないレコードは 400 にする', async ()=> {
    const res = await request('/api/wbs/wbs', { method: 'POST', body: { parent: 99999, name: 'X' } });

    assert.equal(res.status, 400);
    assert.deepEqual((await res.json()).errors, ['wbs/wbs: parent のプロジェクトか WBS が見つかりません。(id=1030, parent=99999)']);
});

test('同時に POST しても、id が重ならない', async ()=> {
    const results = await Promise.all([1, 2, 3, 4, 5].map(n=> request('/api/wbs/wbs', { method: 'POST', body: { parent: 1, name: `WBS ${n}` } })));
    const ids = await Promise.all(results.map(async res=> (await res.json()).record.id));

    assert.deepEqual([...ids].sort(), [1030, 1031, 1032, 1033, 1034]);
    assert.equal(readData('wbs/wbs').length, 13 + 5);
});

test('PATCH でレコードの一部を書き換える', async ()=> {
    const res = await request('/api/er/entities/3', { method: 'PATCH', body: { position: { x: 10, y: 20 } } });

    assert.equal(res.status, 200);
    assert.deepEqual((await res.json()).record.position, { x: 10, y: 20, z: 0 });

    assert.equal((await request('/api/er/entities/3', { method: 'PATCH', body: { _id: 99 } })).status, 400);
    assert.equal((await request('/api/er/entities/999', { method: 'PATCH', body: { name: 'X' } })).status, 404);

    // 入れ子のノード (children) も id で探す。
    const child = await request('/api/deployment/nodes/3', { method: 'PATCH', body: { label: { text: 'NODE 03 改' } } });

    assert.equal(child.status, 200);
    assert.equal(readData('deployment/nodes')[0].children[0].label.text, 'NODE 03 改');
});

test('DELETE は、参照されているレコードを 409 にする', async ()=> {
    const referenced = await request('/api/tm/entities/30000', { method: 'DELETE' });

    assert.equal(referenced.status, 409);
    assert.deepEqual((await referenced.json()).errors, ['tm/relationships: from.entity のエンティティが見つかりません。(id=1, entity=30000)']);

    assert.equal((await request('/api/tm/relationships/1', { method: 'DELETE' })).status, 200);
    assert.equal((await request('/api/tm/entities/30000', { method: 'DELETE' })).status, 200);
    assert.equal(readData('tm/entities').length, 2);
});

test('個人の設定は、無ければ既定値を返し、PATCH で書き換える', async ()=> {
    assert.deepEqual((await (await request('/api/local/account_menus')).json()).data, {});

    const off = await request('/api/local/account_menus', { method: 'PATCH', body: { iHub: { markets: false } } });

    assert.equal(off.status, 200);
    assert.deepEqual(readData('local/account_menus'), { iHub: { markets: false } });

    // null を指定すると消す。(既定値に戻す)
    await request('/api/local/account_menus', { method: 'PATCH', body: { iHub: { markets: null } } });

    assert.deepEqual(readData('local/account_menus'), { iHub: {} });

    assert.equal((await request('/api/local/account_menus', { method: 'PATCH', body: { iHub: { markets: 'off' } } })).status, 400);
    assert.equal((await request('/api/er/entities', { method: 'PATCH', body: { name: 'X' } })).status, 400);
});

test('ほかのサイトからの要求と、JSON でない本文は受け付けない', async ()=> {
    assert.equal((await request('/api/data', { headers: { host: 'evil.example' } })).status, 403);
    assert.equal((await request('/api/data', { headers: { origin: 'https://evil.example' } })).status, 403);
    assert.equal((await request('/api/data', { headers: { origin: 'http://localhost:3000' } })).status, 200);

    const text = await app.request('/api/local/account_menus', {
        method: 'PATCH',
        headers: { host: 'localhost:3000', 'content-type': 'text/plain' },
        body: JSON.stringify({ iHub: { markets: false } }),
    });

    assert.equal(text.status, 415);
    assert.equal(existsSync(join(dir, 'local', 'account_menus.json')), false);
});

test('無い API は 404 にする', async ()=> {
    assert.equal((await request('/api/a/b/c/d')).status, 404);
});

test('GET /api/events は、接続したときに ETag を、書き込んだときに変更を知らせる', async ()=> {
    const res = await request('/api/events');

    assert.equal(res.headers.get('content-type'), 'text/event-stream');
    assert.equal(res.headers.get('cache-control'), 'no-cache, no-transform');

    const events = eventReader(res);

    try {
        const ready = await events.next();

        assert.equal(ready.type, 'ready');
        assert.match(ready.etags['er/entities'], /^"[0-9a-f]{40}"$/);

        // 書き込んだ画面 (タブ) の id も知らせる。
        const patched = await request('/api/local/account_menus', {
            method: 'PATCH',
            body: { iHub: { markets: false } },
            headers: { 'x-ihub-client': 'tab-1' },
        });

        assert.deepEqual(await events.next(), {
            type: 'changed',
            name: 'local/account_menus',
            etag: (await patched.json()).etag,
            client: 'tab-1',
        });
    } finally {
        await events.close();
    }
});

test('ファイルを直接変えたときも、検証してから知らせる', async ()=> {
    app = createApp({ data_dir: dir, watch: true });

    const events = eventReader(await request('/api/events'));
    const file = join(dir, 'wbs', 'wbs.json');
    const wbs = readData('wbs/wbs');

    try {
        await events.next();

        // エディタで書き換えたのと同じように、ファイルを直接書き換える。
        wbs.push({ id: 5000, parent: 1, name: '外で追加' });
        writeFileSync(file, JSON.stringify(wbs, null, 4) + '\n');

        const changed = await events.next(5000);

        assert.equal(changed.type, 'changed');
        assert.equal(changed.name, 'wbs/wbs');
        assert.equal(changed.client, null);

        // ルールに合わない内容は、invalid として知らせる。
        wbs.push({ id: 5001, parent: 99999, name: '親が無い' });
        writeFileSync(file, JSON.stringify(wbs, null, 4) + '\n');

        assert.deepEqual(await events.next(5000), {
            type: 'invalid',
            name: 'wbs/wbs',
            errors: ['wbs/wbs: parent のプロジェクトか WBS が見つかりません。(id=5001, parent=99999)'],
        });
    } finally {
        await events.close();
    }
});

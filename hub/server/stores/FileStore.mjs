// data フォルダの JSON ファイルを読み書きする。
// コレクションの名前 (例: er/entities) を、{root}/er/entities.json に対応させる。
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// JSON の書き方を固定して、git の差分を読みやすく保つ。
export function serialize (data) {
    return JSON.stringify(data, null, 4) + '\n';
}

export function etagOf (data) {
    return '"' + createHash('sha1').update(serialize(data)).digest('hex') + '"';
}

const sleep = (ms)=> new Promise(resolve=> setTimeout(resolve, ms));

// Windows では、ほかのプロセス (エディタやウイルス対策ソフト) がファイルを開いていると rename が失敗することがあるので、少し待ってやり直す。
async function renameWithRetry (from, to) {
    for (let i = 0; ; i++) {
        try {
            return await rename(from, to);
        } catch (e) {
            if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code))
                throw e;

            await sleep(50 * (i + 1));
        }
    }
}

export default class FileStore {
    constructor (root) {
        this.root = root;
    }

    path (name) {
        return join(this.root, ...name.split('/')) + '.json';
    }

    // ファイルが無いときは undefined を返す。
    async read (name) {
        try {
            return JSON.parse(await readFile(this.path(name), 'utf8'));
        } catch (e) {
            if (e.code==='ENOENT')
                return undefined;

            if (e instanceof SyntaxError)
                throw new Error(`data/${name}.json を JSON として読めません。${e.message}`);

            throw e;
        }
    }

    // 一時ファイルに書いてから rename する。(途中で止まっても、書きかけのファイルを残さない)
    async write (name, data) {
        const file = this.path(name);
        const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;

        await mkdir(dirname(file), { recursive: true });
        await writeFile(tmp, serialize(data), 'utf8');

        try {
            await renameWithRetry(tmp, file);
        } catch (e) {
            await rm(tmp, { force: true });
            throw e;
        }
    }
}

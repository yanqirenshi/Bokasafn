// data フォルダの JSON の変更を見張り、変わったコレクションの名前 (例: er/entities) を知らせる。
// エディタや git でファイルを変えたときに、画面へ知らせるために使う。
import { realpathSync, watch } from 'node:fs';
import { sep } from 'node:path';

// fs.watch は 1 回の保存で何度も知らせてくるので、少し待ってからまとめて知らせる。
const DELAY = 100;

export function watchData (dir, onChange) {
    const timers = new Map();

    // Windows では、短い名前 (SATOSH~1 など) を含むパスを見張ると Node.js が異常終了するので、正式なパスに直す。
    const watcher = watch(realpathSync.native(dir), { recursive: true }, (event, filename)=> {
        if (!filename || !filename.endsWith('.json'))
            return;

        const name = filename.split(sep).join('/').slice(0, -'.json'.length);

        clearTimeout(timers.get(name));
        timers.set(name, setTimeout(()=> {
            timers.delete(name);
            onChange(name);
        }, DELAY));
    });

    // 見張りをやめる。
    return ()=> {
        watcher.close();

        for (const timer of timers.values())
            clearTimeout(timer);
    };
}

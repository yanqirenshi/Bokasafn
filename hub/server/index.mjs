// API サーバーを起動する。
//   node server/index.mjs           … API だけ。(開発用。画面は react-scripts start が出し、/api をここへ中継する)
//   node server/index.mjs --static  … API と、ビルドした画面 (build/) を出す。
// ポートは IHUB_API_PORT で変えられる。(既定は 4000)
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from '@hono/node-server';

import { createApp } from './app.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PORT = Number(process.env.IHUB_API_PORT || 4000);
const STATIC = process.argv.includes('--static');

const app = createApp({
    data_dir:   join(ROOT, 'data'),
    static_dir: STATIC ? join(ROOT, 'build') : null,
    // エディタや git で data/ を変えたときも、画面へ知らせる。
    watch:      true,
});

// このパソコンの中からだけ使えるように、127.0.0.1 で待ち受ける。
serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' }, info=> {
    console.log(`iHub の API サーバーを起動しました: http://127.0.0.1:${info.port}/api/data`);

    if (STATIC)
        console.log(`画面: http://127.0.0.1:${info.port}/`);
});

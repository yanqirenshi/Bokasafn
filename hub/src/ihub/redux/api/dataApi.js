import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// この画面 (タブ) の id。
// 書き込むときに API サーバーへ送り、変更の通知が自分の書き込みのものかを見分けるために使う。
export const CLIENT_ID = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2);

// このタブで書き込んだあとの ETag。
const WRITTEN_ETAGS = new Set();

// etag が、このタブで書き込んだ結果のものか。(図が、自分の書き込みでは作り直さないために使う)
export function isWrittenHere (etag) {
    return WRITTEN_ETAGS.has(etag);
}

// 読み込んだ全データのうち、1 つのコレクション ({ name, data, etag }) を差し替える。
export function collectionUpdated (result) {
    return dataApi.util.updateQueryData('getData', undefined, draft=> {
        draft.collections[result.name] = result.data;
        draft.etags[result.name] = result.etag;
    });
}

// 書き込みが終わったら、書き込んだコレクションだけを差し替える。
async function onWritten (arg, { dispatch, queryFulfilled }) {
    try {
        const { data: result } = await queryFulfilled;

        WRITTEN_ETAGS.add(result.etag);
        dispatch(collectionUpdated(result));
    } catch (e) {
        // 失敗は、呼び出した側で扱う。
    }
}

// API サーバー (server/) からデータを読み書きする。
// 起動時に GET /api/data で全データを読み込み、そのあとはコレクションごとに差し替える。
export const dataApi = createApi({
    reducerPath: 'dataApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers)=> {
            headers.set('X-iHub-Client', CLIENT_ID);

            return headers;
        },
    }),
    endpoints: (build)=> ({
        getData: build.query({
            query: ()=> 'data',
        }),
        // オブジェクトのコレクション (個人の設定など) を、JSON Merge Patch で部分的に書き換える。
        patchCollection: build.mutation({
            query: ({ name, patch })=> ({ url: name, method: 'PATCH', body: patch }),
            onQueryStarted: onWritten,
        }),
        // レコードを追加する。(id は API サーバーが振る)
        addRecord: build.mutation({
            query: ({ name, record })=> ({ url: name, method: 'POST', body: record }),
            onQueryStarted: onWritten,
        }),
        // レコードを、JSON Merge Patch で部分的に書き換える。
        patchRecord: build.mutation({
            query: ({ name, id, patch })=> ({ url: `${name}/${id}`, method: 'PATCH', body: patch }),
            onQueryStarted: onWritten,
        }),
    }),
});

export const {
    useGetDataQuery,
    usePatchCollectionMutation,
    useAddRecordMutation,
    usePatchRecordMutation,
} = dataApi;

// 読み込んだ全データ ({ 'er/entities': [...], ... })。
// DataGate が読み込み終えてから描画する部品で使う。
export function useCollections () {
    return useGetDataQuery().data.collections;
}

// API のエラー (RTK Query の error) を、画面に出す文章にする。
export function errorMessage (error, fallback) {
    if (error?.data?.message)
        return [error.data.message, ...(error.data.errors || [])].join('\n');

    return `${fallback}API サーバーが起動しているか、確かめてください。(${error?.status ?? ''})`;
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import S from '@mui/material/Typography';

import Loading from './components/panels/Loading.js';
import { CLIENT_ID, collectionUpdated, dataApi, useGetDataQuery } from './redux/api/dataApi.js';
import { menuPagesChanged } from './redux/slices/accountMenuSlice.js';
import { setWbsData } from './manegers/wbs.js';
import { makePages } from '../config/ACCOUNT_MENUS.js';

// API サーバーからデータを読み込んでから、画面を表示する。
// そのあとは変更の通知を受けて、変わったコレクションだけを読み直す。
export default function DataGate (props) {
    const { data, error } = useGetDataQuery();
    const dispatch = useDispatch();
    const [notice, closeNotice] = useDataEvents();

    const actives = data?.collections['local/account_menus'];

    // サイドメニューに、個人の設定 (on/off) を反映する。
    useEffect(()=> {
        if (actives)
            dispatch(menuPagesChanged(makePages(actives)));
    }, [actives, dispatch]);

    if (error)
        return <LoadError error={error}/>;

    if (!data)
        return <Loading/>;

    // WBS のマネージャは描画の中でそのまま使われるので、描画の前に作り直す。(同じデータなら何もしない)
    setWbsData(data.collections);

    return (
        <>
          {props.children}

          <DataNotice notice={notice} onClose={closeNotice}/>
        </>
    );
}

// API サーバーからの変更の通知 (GET /api/events) を受ける。
// 戻り値は、フォーマットに合わないデータの知らせと、それを閉じる関数。
function useDataEvents () {
    const dispatch = useDispatch();
    const store = useStore();
    const [notice, setNotice] = useState(null);

    useEffect(()=> {
        const etagOf = (name)=> dataApi.endpoints.getData.select()(store.getState()).data?.etags[name];

        const reload = async (name)=> {
            const res = await fetch(`/api/${name}`);

            if (res.ok)
                dispatch(collectionUpdated(await res.json()));
        };

        const source = new EventSource('/api/events');

        // 接続したとき (つながり直したときも) は、取りこぼした変更を読み直す。
        source.addEventListener('ready', (e)=> {
            const { etags } = JSON.parse(e.data);

            for (const [name, etag] of Object.entries(etags))
                if (etagOf(name) && etagOf(name)!==etag)
                    reload(name);
        });

        // ほかで変わったコレクションを読み直す。(このタブの書き込みは、書き込んだときに反映済み)
        source.addEventListener('changed', (e)=> {
            const event = JSON.parse(e.data);

            setNotice(current=> current?.name===event.name ? null : current);

            if (event.client===CLIENT_ID || etagOf(event.name)===event.etag)
                return;

            reload(event.name);
        });

        // フォーマットやルールに合わないデータは、画面に反映せずに知らせる。
        source.addEventListener('invalid', (e)=> setNotice(JSON.parse(e.data)));

        return ()=> source.close();
    }, [dispatch, store]);

    return [notice, ()=> setNotice(null)];
}

function DataNotice (props) {
    const notice = props.notice;

    return (
        <Snackbar open={!!notice} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="warning" onClose={props.onClose} sx={{ whiteSpace: 'pre-wrap' }}>
            {notice && [
                `data/${notice.name}.json がフォーマットやルールに合っていないため、画面に反映していません。`,
                ...notice.errors.slice(0, 5),
            ].join('\n')}
          </Alert>
        </Snackbar>
    );
}

function LoadError (props) {
    const error = props.error;

    return (
        <Box sx={{ p: 6 }}>
          <S variant="h5">データを読み込めませんでした。</S>

          <S sx={{ mt: 2 }}>
            API サーバーが起動しているか、確かめてください。(npm start で、画面と一緒に起動します)
          </S>

          <S sx={{ mt: 2, color: '#888', whiteSpace: 'pre-wrap' }}>
            {error.data?.message || `${error.status} ${error.error || ''}`}
          </S>
        </Box>
    );
}

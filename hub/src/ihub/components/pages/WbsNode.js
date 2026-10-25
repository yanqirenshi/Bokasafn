import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

import Loading from '../panels/Loading.js';
import NotFoundWbsNodeData from '../../../wbs/NotFoundWbsNodeData.js';
import NotFoundWbsNodeComponent from '../../../wbs/NotFoundWbsNodeComponent.js';

import {INDEX_ID} from '../../manegers/wbs.js';

// ページのコンポーネント(lazy)のキャッシュ。key はページファイルのパス(拡張子なし)。
// 描画のたびに lazy を作り直すと、react-router の遷移(startTransition)中に
// 読み込み待ちが繰り返され、前のページが表示されたままになるため、同じページには同じコンポーネントを返す。
const PAGES = {};

function getPage (wbs_node, wbs_id) {
    const path = `${wbs_node.type ? wbs_node.type + '/' : ''}P${wbs_id}`;

    // データに ID があってもページのファイルが無い場合は NotFoundWbsNodeComponent を表示する。
    if (!PAGES[path])
        PAGES[path] = lazy(() => import(`../../../wbs/${path}.js`)
                           .catch(() => ({ default: NotFoundWbsNodeComponent })));

    return PAGES[path];
}

// TODO: あと、ページ無いときの処理とかを入れる。
// https://qiita.com/kakken1988/items/9f14480c8a9f0abf7b3b#chunkloaderror-%E3%81%AE%E5%9B%9E%E9%81%BF%E7%AD%96
export default function WbsNode () {
    const {wbs_id} = useParams();

    const wbs_node = INDEX_ID[wbs_id];

    if (!wbs_node)
        return <NotFoundWbsNodeData/>;

    const Page = getPage(wbs_node, wbs_id);

    return (
        <Suspense fallback={<Loading/>}>
          <Page wbs_node={wbs_node}/>
        </Suspense>
    );
}

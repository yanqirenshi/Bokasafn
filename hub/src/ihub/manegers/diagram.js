import { useEffect, useRef, useState } from 'react';

import { errorMessage, isWrittenHere, useGetDataQuery, usePatchRecordMutation } from '../redux/api/dataApi.js';

// 図 (d3 のライブラリ) に渡すデータを作る。
// names は使うコレクション、build は { 'er/entities': [...], ... } から図のデータを作る関数。
// このタブの書き込み (ドラッグした位置の保存) では作り直さず、ほかからの変更 (エディタ・git・別のタブ) のときだけ作り直す。
// (作り直すと、図を描き直して、表示している位置が初めに戻るため)
// 戻り値の version は、作り直すたびに増える。図の部品の key に使う。
export function useDiagramData (names, build) {
    const { data: all } = useGetDataQuery();
    const built = useRef(null);

    const etags = names.map(name=> all.etags[name]);

    const changed = !built.current
          || etags.some((etag, i)=> etag!==built.current.etags[i] && !isWrittenHere(etag));

    if (changed) {
        built.current = {
            etags,
            version: built.current ? built.current.version + 1 : 0,
            data: build(Object.fromEntries(names.map(name=> [name, all.collections[name]]))),
        };
    } else {
        built.current.etags = etags;
    }

    return built.current;
}

// d3 が要素に結び付けたデータから、レコードの id を取り出す。
// (ライブラリが包んでいるときは _core が元のレコード)
function recordIdOf (d) {
    if (!d)
        return undefined;

    return d._core && d._core.id!==undefined ? d._core.id : d._id;
}

// 要素の位置 (transform の translate)。
function translateOf (element) {
    const transform = element.transform?.baseVal?.consolidate();

    return transform ? { x: transform.matrix.e, y: transform.matrix.f } : null;
}

// 入れ子のレコード (children) も含めて、id から親の id を引けるようにする。
function parentIds (records, key, parent = null, out = new Map()) {
    for (const record of records) {
        out.set(record[key], parent);
        parentIds(record.children || [], key, record[key], out);
    }

    return out;
}

function findRecord (records, key, id) {
    for (const record of records) {
        if (record[key]===id)
            return record;

        const found = findRecord(record.children || [], key, id);

        if (found)
            return found;
    }

    return null;
}

// ドラッグの前後の位置から、ドラッグしたノードと移動量を求める。
// 子のノードは親と一緒に動くので、親と同じだけ動いたノードは除く。
function draggedNodes (records, key, before, after) {
    const parents = parentIds(records, key);

    const delta = (id)=> {
        const a = before.get(id);
        const b = after.get(id);

        return a && b ? { dx: b.x - a.x, dy: b.y - a.y } : { dx: 0, dy: 0 };
    };

    const out = [];

    for (const id of after.keys()) {
        const { dx, dy } = delta(id);

        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)
            continue;

        const parent = parents.get(id);

        if (parent!==undefined && parent!==null) {
            const p = delta(parent);

            // 小数の誤差があるので、少しの違いは同じ移動量とみなす。
            if (Math.abs(p.dx - dx) < 0.5 && Math.abs(p.dy - dy) < 0.5)
                continue;
        }

        out.push({ id, dx, dy });
    }

    return out;
}

// 図のノードをドラッグで動かしたら、動かしたノードの位置 (position) を保存する。
// d3 のライブラリはドラッグの終わりを知らせないので、ドラッグの前後でノードの要素の位置を比べる。
//   ref:        図を囲む要素
//   selector:   ノードの要素 (例: 'g.table')
//   collection: 位置を保存するコレクション (例: 'er/entities')
//   key:        レコードの id のプロパティ (既定は 'id')
// 戻り値は、保存できなかったときのメッセージと、それを消す関数。
export function useSavePositions (ref, { selector, collection, key = 'id' }) {
    const { data: all } = useGetDataQuery();
    const [patchRecord] = usePatchRecordMutation();
    const [error, setError] = useState(null);

    // イベントの中から、最新のデータを読むため。
    const latest = useRef(all);
    latest.current = all;

    useEffect(()=> {
        const container = ref.current;

        if (!container)
            return;

        const positions = ()=> {
            const out = new Map();

            for (const element of container.querySelectorAll(selector)) {
                const id = recordIdOf(element.__data__);
                const position = translateOf(element);

                if (id!==undefined && position)
                    out.set(id, position);
            }

            return out;
        };

        const save = async (before, after)=> {
            const records = latest.current.collections[collection];

            for (const { id, dx, dy } of draggedNodes(records, key, before, after)) {
                const record = findRecord(records, key, id);

                if (!record || !record.position)
                    continue;

                const position = {
                    x: Math.round(record.position.x + dx),
                    y: Math.round(record.position.y + dy),
                };

                try {
                    await patchRecord({ name: collection, id, patch: { position } }).unwrap();
                } catch (e) {
                    setError(errorMessage(e, '動かした位置を保存できません。'));
                }
            }
        };

        let before = null;

        const down = ()=> {
            before = positions();
        };

        const up = ()=> {
            if (!before)
                return;

            const start = before;

            before = null;

            // d3 のドラッグの終わりの処理が済んでから比べる。
            setTimeout(()=> save(start, positions()), 0);
        };

        container.addEventListener('mousedown', down, true);
        container.addEventListener('touchstart', down, true);
        // ドラッグの終わりは、キャプチャ段階で受ける。
        // d3 のドラッグは、ドラッグの終わりに window のキャプチャ段階で mouseup の伝わりを止めるため、
        // バブリング段階で受けると呼ばれない。(ここで付けるほうが d3 より先に登録されるので、先に呼ばれる)
        window.addEventListener('mouseup', up, true);
        window.addEventListener('touchend', up, true);

        return ()=> {
            container.removeEventListener('mousedown', down, true);
            container.removeEventListener('touchstart', down, true);
            window.removeEventListener('mouseup', up, true);
            window.removeEventListener('touchend', up, true);
        };
    }, [ref, selector, collection, key, patchRecord]);

    return [error, ()=> setError(null)];
}

"use client";

import Link from '../assemblies/Link.js';

import Table from './Wnqi.Big.Size/index.js';
import { useWbs } from '../../manegers/wbs.js';

export default function WBSTable (props) {
    const start_id = props.start_id || null;
    const columns = props.columns || defaultColumns();

    const wbs = useWbs();

    if (!wbs)
        return null;

    const wbs_source = {
        projects:     wbs.data().projects.list,
        wbs:          wbs.data().wbs.list,
        workpackages: wbs.data().wp.list,
        edges:        wbs.data().edges.list,
    };

    const options = {}; // or null
    const style_table = { fontSize: '16px' }; // or null

    // 表はデータが変わっても作り直さないので、WBS が変わったら表ごと作り直す。
    return (
        <Table key={wbs.version}
               source={wbs_source}
               columns={columns}
               options={options}
               style={style_table}
               start_id={start_id}/>
    );
}

function defaultColumns () {
    return [
        {
            label: 'Code',
            required: true,
            contents: (c, d) => {
                return (
                    <Link href={`/wbs/${d._id}`}>
                      {d._id}
                    </Link>
                );
            },
        },
        {
            label: 'Name',
            leveling: true,
            required: true,
            contents: (c, d) => d.label,
        },
        {
            label: 'Description',
            contents: (c, d) => {
                return d.description;
            },
        },
    ];
}

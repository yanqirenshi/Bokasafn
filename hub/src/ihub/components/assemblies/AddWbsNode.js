import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import S from '@mui/material/Typography';

import Link from './Link.js';
import { errorMessage, useAddRecordMutation } from '../../redux/api/dataApi.js';

// 追加できるノードの種類。
// プロジェクトの下には WBS だけ、WBS の下には WBS とワークパッケージを置ける。(ワークパッケージの下には置けない)
const KINDS = {
    WBS:         { label: 'WBS',             collection: 'wbs/wbs' },
    WORKPACKAGE: { label: 'ワークパッケージ', collection: 'wbs/workpackages' },
};

const CHILD_KINDS = {
    PROJECT: ['WBS'],
    WBS:     ['WBS', 'WORKPACKAGE'],
};

// WBS のノード (parent) の下に、子のノードを追加するフォーム。
export default function AddWbsNode (props) {
    const parent = props.parent;
    const kinds = CHILD_KINDS[parent._class] || [];

    const [kind, setKind] = useState(kinds[0]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState(null);

    const [addRecord, { isLoading }] = useAddRecordMutation();

    if (kinds.length===0)
        return null;

    const submit = async (e)=> {
        e.preventDefault();

        if (!name.trim())
            return setMessage({ error: '名前を入力してください。' });

        setMessage(null);

        const record = {
            parent: parent._id,
            name: name.trim(),
            ...(description.trim() ? { description: description.trim() } : {}),
        };

        try {
            const result = await addRecord({ name: KINDS[kind].collection, record }).unwrap();

            setName('');
            setDescription('');
            setMessage({ added: result.record });
        } catch (error) {
            setMessage({ error: errorMessage(error, '追加できません。') });
        }
    };

    return (
        <Box component="form" onSubmit={submit} sx={{ mb: 3 }}>
          <S sx={{ mb: 1 }}>{parent.name} の下に追加する</S>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField select size="small" label="種類" value={kind}
                       onChange={e=> setKind(e.target.value)}
                       sx={{ minWidth: 160 }}>
              {kinds.map(k=> <MenuItem key={k} value={k}>{KINDS[k].label}</MenuItem>)}
            </TextField>

            <TextField size="small" label="名前" value={name} required
                       onChange={e=> setName(e.target.value)}
                       sx={{ minWidth: 240 }}/>

            <TextField size="small" label="説明" value={description}
                       onChange={e=> setDescription(e.target.value)}
                       sx={{ flex: 1, minWidth: 240 }}/>

            <Button type="submit" variant="contained" disabled={isLoading}>
              追加
            </Button>
          </Box>

          {message?.error &&
           <S color="error" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{message.error}</S>}

          {message?.added &&
           <S sx={{ mt: 1 }}>
             追加しました: <Link href={`/wbs/${message.added.id}`}>{message.added.name} ({message.added.id})</Link>
           </S>}
        </Box>
    );
}

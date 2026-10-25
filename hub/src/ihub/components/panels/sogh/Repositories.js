import React, { useEffect } from 'react';
import Box from '@mui/material/Box';

import { Repositories as SoghRepositories } from 'sogh';

import { useDispatch, useSelector } from 'react-redux';
import { fetchRepositories } from '../../../redux/slices/scrumSlice.js';

import sogh from '../../../manegers/sogh.js';
import ErrorBoundary from '../../parts/ErrorBoundary.js';
import Loading from '../Loading.js';

export default function Repositories () {
    const dispatch = useDispatch();
    const authed = useSelector(s=> s.githubAuth.value);
    const { status, ids } = useSelector(s=> s.scrum.repositories);

    useEffect(()=> {
        if (authed===true && status==='idle')
            dispatch(fetchRepositories());
    }, [authed, status, dispatch]);

    if (authed===true && (status==='idle' || status==='loading'))
        return <Loading/>;

    const repositories = Array.isArray(ids)
          ? ids.map(id=> sogh.repository(id)).filter(Boolean)
          : [];

    return (
        <Box sx={{ p:2, overflow: 'auto', height: '100%' }}>
          <Box sx={{ width: 666, ml:'auto', mr: 'auto', pb: 22 }}>
            <ErrorBoundary fallback="Repositories の取得・表示でエラーが発生しました。">
              <SoghRepositories data={repositories} sogh={sogh}/>
            </ErrorBoundary>
          </Box>
        </Box>
    );
}

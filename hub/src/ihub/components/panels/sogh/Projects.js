import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import {ProjectsV2} from 'sogh';

import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectsV2 } from '../../../redux/slices/scrumSlice.js';

import sogh from '../../../manegers/sogh.js';
import ErrorBoundary from '../../parts/ErrorBoundary.js';
import Loading from '../Loading.js';

export default function Projects () {
    const dispatch = useDispatch();
    const authed = useSelector(s=> s.githubAuth.value);
    const { status, ids } = useSelector(s=> s.scrum.projectsV2);

    useEffect(()=> {
        if (authed===true && status==='idle')
            dispatch(fetchProjectsV2());
    }, [authed, status, dispatch]);

    if (authed===true && (status==='idle' || status==='loading'))
        return <Loading/>;

    const projects = Array.isArray(ids)
          ? ids.map(id=> sogh.projectV2(id)).filter(Boolean)
          : [];

    return (
        <Box sx={{ p:2, overflow: 'auto', height: '100%' }}>
          <Container maxWidth="lg">
            <ErrorBoundary fallback="Projects の取得・表示でエラーが発生しました。">
              <ProjectsV2 data={projects} sogh={sogh}/>
            </ErrorBoundary>
          </Container>
        </Box>
    );
}

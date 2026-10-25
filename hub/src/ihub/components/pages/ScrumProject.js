import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';

import { useDispatch, useSelector } from 'react-redux';
import { projectKey, fetchProjectV2, fetchProjectV2Items } from '../../redux/slices/scrumProjectSlice.js';

import Loading from '../panels/Loading.js';
import Frame from '../assemblies/frames/Frame.js';

import {ProjectV2Contents, ProjectV2Details} from 'sogh';

import sogh from '../../manegers/sogh.js';

export default function ScrumProject (props) {
    return (
        <Project/>
    );
}

function Project () {
    let {login, number} = useParams();

    const dispatch = useDispatch();
    const authed = useSelector(s=> s.githubAuth.value);
    const key = projectKey(login, number);
    const entry = useSelector(s=> s.scrumProject.byKey[key]);

    useEffect(()=> {
        if (authed===true && !entry) {
            dispatch(fetchProjectV2({login, number}));
            dispatch(fetchProjectV2Items({login, number}));
        }
    }, [authed, entry, login, number, dispatch]);

    if (authed!==true || !entry || entry.project.status==='loading' || entry.items.status==='loading')
        return <Loading/>;

    const project = entry.project.id;
    const project_items = entry.items.ids;

    return (
        <Frame>
          <Box sx={{width:'100%', height:'100%', overflow: 'auto'}}>
            <ProjectV2Contents project={sogh.projectV2(project)}/>
            <ProjectV2Details project={sogh.projectV2(project)}
                              items={project_items.map(id=> sogh.projectV2Item(id))}/>
          </Box>
        </Frame>
    );
}

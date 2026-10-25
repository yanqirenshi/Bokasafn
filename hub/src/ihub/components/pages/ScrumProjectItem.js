import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { useDispatch, useSelector } from 'react-redux';
import { fetchIssue, fetchIssueComments } from '../../redux/slices/scrumProjectItemSlice.js';

import Tabs from './ScrumProjectItem/Tabs.js';

import sogh from '../../manegers/sogh.js';

import Loading from '../panels/Loading.js';
import Frame from '../assemblies/frames/Frame.js';

import {
    ProjectV2Item, PanelIssue, PanelIssueComments
} from 'sogh';

export default function ScrumProjectItem (props) {
    let {id} = useParams();

    return (
        <Frame>
          <Box sx={{height:'100%', overflow:'auto'}}>
            <Container sx={{mb:22}}>
              <Item item_id={id}/>
            </Container>
          </Box>
        </Frame>
    );
}

function Item (props) {
    const item_id = props.item_id;

    const [tabs, setTabs] = React.useState({
        selected: 'content',
        list: [
            { code: 'content',   label: 'Content' },
            { code: 'points',    label: 'Points' },
        ],
    });

    const item = sogh.projectV2Item(item_id);

    const typename = item.contentTypename();

    return (
        <>
          {/* Item */}
          <Box>
            <ProjectV2Item item={item}/>
          </Box>

          <Box sx={{mt:3}}>
            <Tabs tabs={tabs}
                  onChange={new_tabs=> setTabs(new_tabs)}/>
          </Box>

          {/* Item Contents*/}
          {'content'===tabs.selected &&
           <Box>
             {'Issue'===typename &&
              <IssueContent issue_id={item.content().id}/>}

             {'DraftIssue'===typename &&
              <div>DraftIssue</div>}
           </Box>}

          {'points'===tabs.selected &&
           <Box>Points</Box>}
        </>
    );
}

function IssueContent (props) {
    const id = props.issue_id;

    const dispatch = useDispatch();
    const entry = useSelector(s=> s.scrumProjectItem.byId[id]);

    useEffect(()=> {
        if (!entry) {
            dispatch(fetchIssue(id));
            dispatch(fetchIssueComments(id));
        }
    }, [entry, id, dispatch]);

    if (!entry || entry.issue.status==='loading' || entry.comments.status==='loading')
        return <Loading/>;

    const issue = sogh.issue(entry.issue.id);
    const comments = entry.comments.ids.map(id=> sogh.issueComment(id));

    return (
        <>
          <PanelIssue data={issue}/>
          <PanelIssueComments comments={comments}/>
        </>
    );
}

import React, { useEffect } from 'react';

import Frame from '../assemblies/frames/Frame.js';
import { Monitor, Card } from '../panels/cockpit/index.js';
import Loading from '../panels/Loading.js';

import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../redux/slices/cockpitSlice.js';

import sogh from '../../manegers/sogh.js';

export default function Cockpit () {
    const dispatch = useDispatch();

    const authed = useSelector(s=> s.githubAuth.value);
    const { status, issueIds } = useSelector(s=> s.cockpit);

    useEffect(()=> {
        if (authed===true && status==='idle')
            dispatch(fetchIssues());
    }, [authed, status, dispatch]);

    if (authed===true && (status==='idle' || status==='loading'))
        return <Loading/>;

    const cards = [
        ...issues2cards(issueIds)
    ];

    return (
        <Frame>
          <Monitor>
            {cards.map(card=> {
                return <Card key={card.id} data={card}/>;
            })}
          </Monitor>
        </Frame>
    );
}

function issues2cards (issues) {
    if (!Array.isArray(issues))
        return [];

    const viewer = sogh.viewer();
    const viewer_login = viewer ? viewer.login() : null;

    return issues.reduce((list,issue_id)=> {
        const issue = sogh.issue(issue_id);

        if (viewer_login && issue.assignees().find(ass=>ass.login===viewer_login))
            list.push({
                type: 'GITHUB ISSUE',
                id: issue_id,
                data: issue,
            });

        return list;
    }, []);
}

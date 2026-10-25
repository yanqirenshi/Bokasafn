import React from 'react';
import { useParams } from "react-router";

import Container from '@mui/material/Container';
import {Section, P, LinkOS} from 'tion'; // , S

import Frame from '../ihub/components/assemblies/frames/FrameWbsNodeTabs.js';

import Attribute from './P1033/Attribute.js';
import Description from './P1033/Description.js';
import Entity from './P1033/Entity.js';
import Identifier from './P1033/Identifier.js';
import Relationship from './P1033/Relationship.js';

import wbs from '../ihub/manegers/wbs.js';

export default function P1033 (props) {
    const [tab, setTab] = React.useState('entity' || null);
    const [tabs] = React.useState([
        { code: 'identifier',   label: 'Identifier' },
        { code: 'entity',       label: 'Entity' },
        { code: 'relationship', label: 'Relationship'},
        { code: 'attribute',    label: 'Attribute' },
        { code: 'description',  label: '概要' },
    ]);

    const wbs_node = wbs.get(useParams().wbs_id);

    return (
        <Frame tabs={tabs} tab={tab} onChangeTab={(v)=>setTab(v)}
               wbs_node={wbs_node}>

          { tab==='identifier'   && <Identifier/>}
          { tab==='entity'       && <Entity/>}
          { tab==='relationship' && <Relationship/>}
          { tab==='attribute'    && <Attribute/>}
          { tab==='description'  && <Description/>}

        </Frame>
    );
}

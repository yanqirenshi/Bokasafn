import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';

import SystemDynamics from '../panels/SystemDynamics.js';
import TM from '../panels/TM.js';
import Procedures from '../panels/Procedures.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Business () {
    const [tabs, changeTabs] = usePageTabs('PAGE_BUSINESS');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'systemic-design'===tab && <SystemDynamics/>}
          {'tm'===tab              && <TM/>}
          {'procedures'===tab      && <Procedures/>}
          {'wbs'===tab             && <Wbs/>}
          {'help'===tab            && <HelpEmpty/>}
        </Frame>
    );
}

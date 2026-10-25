import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function DevOps () {
    const [tabs, changeTabs] = usePageTabs('PAGE_DEVOPS');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'bpmn'===tab && <div/>}
          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

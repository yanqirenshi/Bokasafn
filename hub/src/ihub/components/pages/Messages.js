import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';
import Model from '../panels/messages/Model.js';

export default function Messages () {
    const [tabs, changeTabs] = usePageTabs('PAGE_MESSAGES');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'model'===tab && <Model/>}
          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

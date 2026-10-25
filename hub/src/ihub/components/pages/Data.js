import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import ER from '../panels/ER.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Data () {
    const [tabs, changeTabs] = usePageTabs('PAGE_DATA');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'er-diagram'===tab && <ER/>}
          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

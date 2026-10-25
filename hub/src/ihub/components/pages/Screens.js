import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import ScreenTransitionDiagram from '../panels/std/ScreenTransitionDiagram.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Screens () {
    const [tabs, changeTabs] = usePageTabs('PAGE_SCREENS');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'screen-transition-diagram'===tab && <ScreenTransitionDiagram/>}
          {'wbs'===tab && <Wbs start_id="1002"/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

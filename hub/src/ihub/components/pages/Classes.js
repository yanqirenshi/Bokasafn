import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';
import Frame from '../assemblies/frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Classes () {
    const [tabs, changeTabs] = usePageTabs('PAGE_CLASSES');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'systemic-design'===tab && <div/>}
          {'tm'===tab && <div/>}
          {'procedures'===tab && <div/>}

          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

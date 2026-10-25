import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import * as panel from '../panels/sogh/index.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Scrum () {
    const [tabs, changeTabs] = usePageTabs('PAGE_SCRUM');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'repositories'===tab && <panel.Repositories/>}
          {'projects'===tab && <panel.Projects/>}
          {'account'===tab && <panel.Account/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

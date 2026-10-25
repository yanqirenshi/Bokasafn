import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import SystemConfigurationDiagram from '../panels/scd/SystemConfigurationDiagram.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function SystemEnvironment () {
    const [tabs, changeTabs] = usePageTabs('PAGE_SYSTEMS');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'system-configuration-diagram'===tab && <SystemConfigurationDiagram/>}
          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

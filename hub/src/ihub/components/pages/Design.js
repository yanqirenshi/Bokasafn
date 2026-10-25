import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

import Panels from '../panels/design/Panels.js';
import Assemblies from '../panels/design/Assemblies.js';
import Parts from '../panels/design/Parts.js';
import Events from '../panels/design/Events.js';

export default function Design () {
    const [tabs, changeTabs] = usePageTabs('PAGE_DESIGN');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'ui-panels'===tab && <Panels/>}
          {'ui-assemblies'===tab && <Assemblies/>}
          {'ui-parts'===tab && <Parts/>}
          {'ui-events'===tab && <Events/>}
          {'wbs'===tab && <Wbs start_id="1001"/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}

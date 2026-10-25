import React from 'react';

import { usePageTabs } from '../../../redux/slices/tabsSlice.js';

import Frame from '../../assemblies/frames/FrameTabs.js';
import Overview from '../../panels/bpmn/Overview.js';
import Palettes from '../../panels/bpmn/Palettes.js';
import Methods from '../../panels/bpmn/Methods.js';
import Styles from '../../panels/bpmn/Styles.js';

export default function BPMN () {
    const [tabs, changeTabs] = usePageTabs('PAGE_BPMN');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>
          {'palettes'===tab && <Palettes/>}
          {'methods'===tab  && <Methods/>}
          {'styles'===tab   && <Styles/>}
          {'overview'===tab            && <Overview/>}
        </Frame>
    );
}

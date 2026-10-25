import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';

import Menus from '../panels/account/Menus.js';
import Operators from '../panels/account/Operators.js';
import Pages from '../panels/account/Pages.js';

export default function Account () {
    const [tabs, changeTabs] = usePageTabs('PAGE_ACCOUNT');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'menus'     === tab && <Menus/>}
          {'operators' === tab && <Operators/>}
          {'pages'     === tab && <Pages/>}
        </Frame>
    );
}

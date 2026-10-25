import React from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import Overview from '../panels/ddd/Overview.js';
import LayerArchitecture from '../panels/ddd/LayerArchitecture.js';
import UbiquitousLanguage from '../panels/ddd/UbiquitousLanguage.js';
import ModelDrivenDesign from '../panels/ddd/ModelDrivenDesign.js';
import HandsOnModeler from '../panels/ddd/HandsOnModeler.js';
import DeclarativeDesign from '../panels/ddd/DeclarativeDesign.js';

export default function DDD () {
    const [tabs, changeTabs] = usePageTabs('PAGE_DDD');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>
          {'overview'===tab && <Overview/>}
          {'layer-architecture'===tab && <LayerArchitecture/>}
          {'ubiquitous-language'===tab && <UbiquitousLanguage/>}
          {'model-driven-design'===tab && <ModelDrivenDesign/>}
          {'hands-on-modeler'===tab && <HandsOnModeler/>}
          {'declarative-design'===tab && <DeclarativeDesign/>}
        </Frame>
    );
}

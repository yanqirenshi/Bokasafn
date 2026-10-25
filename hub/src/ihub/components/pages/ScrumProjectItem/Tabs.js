import React from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';

export default function Tabs (props) {
    const tabs = props.tabs;
    const onChange = props.onChange;

    const change = (e,v)=> {
        const new_tabs = {...tabs};
        new_tabs.selected = v;
        onChange(new_tabs);
    };

    return (
        <MuiTabs value={tabs.selected}
                 onChange={change}
                 aria-label="wrapped label tabs example">
          {tabs.list.map(tab=> {
              return (
                  <MuiTab key={tab.code}
                          value={tab.code}
                          label={tab.label} />
              );
          })}
        </MuiTabs>
    );
}

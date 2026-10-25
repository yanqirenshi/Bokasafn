import { useSearchParams } from "react-router-dom";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function TabsSearchParam (props) {
    const tabs = props.tabs || [];
    const tab = props.value;
    const onChange = props.onChange;

    const [searchParams, setSearchParams] = useSearchParams();

    if (tabs.length===0) return null;

    const changeTab = (e, new_code) => {
        searchParams.set('tab', new_code);
        setSearchParams(searchParams);
        onChange(new_code);
    };

    if (!tab && tabs.length > 0)
        onChange(tabs[0].code);

    return (
        <Tabs value={tab} onChange={changeTab}>
          {tabs.map((tab) => (
            <Tab key={tab.code}
                 label={tab.label}
                 value={tab.code} />
          ))}
        </Tabs>
    );
}

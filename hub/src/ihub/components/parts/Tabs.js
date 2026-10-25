import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';

export default function Tabs (props) {
    const data = props.data;
    const onChange = props.onChange;

    const change = (e,v)=> {
        if (!onChange) return;

        const new_data = {...data};
        new_data.selected = v;

        onChange(new_data);
    };

    return (
        <Box sx={{background:'#f8f8f8'}}>
          <MuiTabs value={data.selected}
                   onChange={change}
                   centered>
            {data.list.map((tab)=> {
                return (
                    <MuiTab key={tab.code}
                            value={tab.code}
                            label={tab.label}/>
                );
            })}
          </MuiTabs>
        </Box>
    );
}

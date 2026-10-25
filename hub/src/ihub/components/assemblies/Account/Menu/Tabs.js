import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';

export default function Tabs (props) {
    const menu = props.menu;
    const actions = props.actions;

    const tabs = menu.pages.map(d=>d.label);

    const clickTab = (e,v)=> {
        const new_menu = {...menu};
        new_menu.current_page = v;
        actions.menu.change(new_menu);
    };

    return (
        <Box>
          <MuiTabs value={menu.current_page}
                   onChange={clickTab}>
            {tabs.map(tab=> {
                return (
                    <MuiTab key={tab}
                            label={tab}
                            sx={{minWidth: '66px'}}
                            value={tab}/>
                );
            })}
          </MuiTabs>
        </Box>
    );
}

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import Beach from '@yanqirenshi/beach';
//import * as u from '../../libs/yutils/index.js';

import Head from './Menu/Head.js';
import Foot from './Menu/Foot.js';
import Item from './Menu/Item.js';
import Tabs from './Menu/Tabs.js';

const u = new Beach();

export default function Menu (props) {
    const menu = props.menu || [];
    const actions = props.actions;

    const selected_page_num = menu.pages.findIndex(page=> page.label===menu.current_page);
    const selected_page = menu.pages[selected_page_num];

    const change = actions.menu.change;

    const enterd = ()=> change(u.catom(menu, (new_menu)=> {
        new_menu.menu.enterd = true;
    }));

    const leaved = ()=> change(u.catom(menu, (new_menu)=> {
        new_menu.menu.enterd = false;
    }));

    return (
        <Box onMouseEnter={enterd}
             onMouseLeave={leaved}>
          <Paper sx={sx()}>
            <Head/>

            <Tabs menu={menu} actions={actions}/>

            <Box sx={sx().body}>
              {selected_page.items.map((item,i)=> {
                  return <Item key={i} data={item}/>;
              })}
            </Box>

            <Foot/>
          </Paper>
        </Box>
    );
}

function sx () {
    return {
        position: 'fixed',
        top: 8,
        left: 8,
        background: '#fff',
        // height: '100vh',
        zIndex: 8888887,
        display: 'flex',
        flexDirection: 'column',
        body: {
            padding: '11px 22px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
        }
    };
}

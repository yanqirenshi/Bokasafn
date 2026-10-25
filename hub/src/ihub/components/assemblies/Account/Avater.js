import * as React from 'react';
import Box from '@mui/material/Box';
import AvatarIcon from '@mui/material/Avatar';

import Beach from '@yanqirenshi/beach';
// import * as u from '../../libs/yutils/index.js';

const u = new Beach();

export default function Avater (props) {
    const menu = props.menu;
    const actions = props.actions;

    const change = actions.menu.change;

    const click = ()=> change(u.catom(menu, (new_menu)=> {
        new_menu.avater.clicked = !new_menu.avater.clicked;

        if (new_menu.avater.clicked)
            return;

        new_menu.avater.enterd = false;
        new_menu.menu.enterd = false;
    }));

    const enterd = ()=> change(u.catom(menu, (new_menu)=> {
        new_menu.avater.enterd = true;
        new_menu.menu.enterd = true;
    }));

    const leaved = ()=> change(u.catom(menu, (new_menu)=> {
        new_menu.avater.enterd = false;
    }));

    return (
        <Box className={menu.avater.clicked ? 'pair-color1' : 'theme-color3'}
             sx={sx(menu)}>
          <Box sx={{
              display:'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#fff',
              width: 44,
              height: 44,
              borderRadius: 44,
          }}>
            <AvatarIcon alt="Yanqirenshi"
                      src="https://avatars.githubusercontent.com/u/346975?s=400&u=9689e695c587cadccb01c45a8d5df58d4d61cf1e&v=4"
                      onClick={click}
                      onMouseEnter={enterd}
                      onMouseLeave={leaved}/>
          </Box>
        </Box>
    );
}

function sx (menu) {
    return {
        position: 'fixed',
        top: 18,
        left: 22,
        padding: 0.5,
        borderRadius: 44,
        zIndex: 8888888,
        boxSizing: 'border-box',
    };
}

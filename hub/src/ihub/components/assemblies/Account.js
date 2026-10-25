import * as React from 'react';
import Avatar from './Account/Avater.js';
import Menu from './Account/Menu.js';

export default function Account (props) {
    const menu = props.menu;
    const actions = props.actions;

    return (
        <>
          <div style={{position: 'fixed', right: 22, top: 22}}>
            <p>avater.clicked = {menu.avater.clicked ? 't' : 'f'}</p>
            <p>avater.enterd  = {menu.avater.enterd  ? 't' : 'f'}</p>
            <p>menu.enterd    = {menu.menu.enterd    ? 't' : 'f'}</p>
          </div>
          <Avatar menu={menu} actions={actions}/>
          {isOpenMenu(menu) &&
           <Menu menu={menu} actions={actions}/>}
        </>
    );
}

function isOpenMenu (menu) {
    return menu.avater.clicked
        || menu.avater.enterd
        || menu.menu.enterd;
}

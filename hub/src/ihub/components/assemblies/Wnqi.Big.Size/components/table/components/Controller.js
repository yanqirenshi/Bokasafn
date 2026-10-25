import React from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import STYLE from './Style.js';
const style = STYLE.controller;

function Controller (props) {
    const style_right = {...style.center};

    if (props.open)
        style_right.background = '#f3f3f3';

    const callbacks = props.callbacks;
    const clickColumns = () => callbacks.chooser.switch();
    const clickSwidthVisibleWp = () => callbacks.wp.visible(!props.visible_wp);
    const changeFilter = (e) => callbacks.filter.change(e.target.value);

    const xxx = () => callbacks.download();

    return (
        <div style={style.root}>
          <div style={style.left}>
            <Button variant="outlined" size="small"
                    style={props.visible_wp ? {fontWeight:'bold'} : null}
                    title="Workpackage の表示/非表示を切り替える"
                    onClick={clickSwidthVisibleWp}>
              WP
            </Button>

            <div style={{marginLeft:11, width: '100%'}}>
              <TextField hiddenLabel
                         style={{width:'100%'}}
                         id="filled-hidden-label-small"
                         variant="filled"
                         size="small"
                         placeholder="Filter Workpackage"
                         onChange={changeFilter}
                         value={props.filter_wp}/>
            </div>
          </div>

          <div style={style_right}>
            <Button variant="outlined" size="small"
                    onClick={clickColumns}>
              Columns
            </Button>
          </div>

          <div style={style.right}>
            <Button variant="outlined" size="small"
                    onClick={xxx}>
              <FontAwesomeIcon icon={faDownload} style={{fontSize: 14}}/>
            </Button>
          </div>
        </div>
    );
}

export default Controller;

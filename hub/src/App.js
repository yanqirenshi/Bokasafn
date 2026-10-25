import React from 'react';
import { useDispatch } from 'react-redux';

import Box from '@mui/material/Box';

import { windowResized } from './ihub/redux/slices/windowSlice.js';

import Router from './Router.js';
import Github from './ihub/Github.js';

export default function App () {
    const dispatch = useDispatch();

    React.useEffect(()=> {
        const handleResize= ()=> dispatch(windowResized({
            w: window.innerWidth,
            h: window.innerHeight
        }));

        handleResize();

        window.addEventListener("resize", handleResize);
    }, [dispatch]);

    return (
        <Box className="theme-color5">
          <Github/>

          <Router/>
        </Box>
    );
}

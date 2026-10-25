import React from 'react';

import Button from '@mui/material/Button';

function ButtonVisible (props) {
    const click = () => {
        props.callbacks.body.row.visible(props.source.number, !props.source.visible);
    };

    return (
        <Button variant="outlined" size="small"
                onClick={click}>
          表示
        </Button>
    );
}

export default ButtonVisible;

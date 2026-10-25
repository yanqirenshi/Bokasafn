import React from 'react';

import Frame from '../assemblies/frames/Frame.js';

export default function Auth () {
  return (
      <Frame>
        <div style={sx()}>Auth</div>
      </Frame>
  );
}

function sx () {
    return {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '333px',
        background: '#eee',
        color: '#eaeaea',
    };
}

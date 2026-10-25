import React, { useRef } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { useDiagramData, useSavePositions } from '../../manegers/diagram.js';

// 図 (d3 のライブラリ) を囲む部品。
// ドラッグで動かしたノードの位置を保存し、ほかからデータが変わったときは図を作り直す。
//   names:     図に使うコレクション
//   build:     コレクションから、図に渡すデータを作る関数
//   positions: 位置を保存する先 ({ selector, collection, key })
//   render:    図に渡すデータを受け取り、図の部品を返す関数
export default function DiagramBox (props) {
    const ref = useRef(null);

    const { data, version } = useDiagramData(props.names, props.build);
    const [error, closeError] = useSavePositions(ref, props.positions);

    return (
        <Box ref={ref} sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <React.Fragment key={version}>
            {props.render(data)}
          </React.Fragment>

          {error &&
           <Alert severity="error" onClose={closeError}
                  sx={{ position: 'absolute', top: 8, left: 8, right: 8, whiteSpace: 'pre-wrap' }}>
             {error}
           </Alert>}
        </Box>
    );
}

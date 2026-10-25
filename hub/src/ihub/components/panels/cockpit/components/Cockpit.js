import Box from '@mui/material/Box';

import Masonry from '@yanqirenshi/react-masonry-component';

const MASONRY_OPTIONS = {
    transitionDuration: 0, // 並べ替えのアニメーションは付けない
    fitWidth: true, // カードの列を中央に寄せる
};

// カードを masonry (石積み) レイアウトで並べる。
// 列数は Masonry が親の幅から決める。
export default function Cockpit (props) {
    const children = props.children;

    return (
        <Box sx={{
            height: '100%',
            overflow: 'auto',
            pt: 3,
            pb: 22, // 最後のカードがドックに隠れないようにする
            px: '111px', // サイドメニューとドックにカードが隠れないようにする
            boxSizing: 'border-box',
        }}>
          {/* enableResizableChildren: 表示後にカードの高さが変わっても (フォントの読み込みなど) 並び直す */}
          <Masonry options={MASONRY_OPTIONS}
                   enableResizableChildren
                   style={{margin: '0 auto'}}>
            {children}
          </Masonry>
        </Box>
    );
}

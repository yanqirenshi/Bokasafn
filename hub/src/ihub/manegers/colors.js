import { createTheme } from '@mui/material/styles';

import COLORS from '../../config/COLORS.js';

// src/config/COLORS.js の配色を、部品ごとの形にする。
// 色が null のときは、その部品のこれまでの色のままにする。

// '#rrggbb' (または '#rgb') を { r, g, b } にする。
// 形が違うときは null を返す。(menubook・manipulater は { r, g, b } で色を受け取る)
export function rgbOf (color) {
    if (typeof color !== 'string')
        return null;

    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());

    if (!m)
        return null;

    const hex = m[1].length === 3
          ? m[1].split('').map(c=> c + c).join('')
          : m[1];

    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
}

// 決めてある色だけを取り出す。
function colorOf (name) {
    return rgbOf(COLORS[name]) ? COLORS[name].trim() : null;
}

export const BASE   = colorOf('base');
export const MAIN   = colorOf('main');
export const SUB    = colorOf('sub');
export const ACCENT = colorOf('accent');

// ドックのボタンと吹き出しの色。({ r, g, b })
// null のときは、manipulater の既定の色 (青緑) になる。
export const DOCK_COLOR = rgbOf(MAIN);

// MUI のテーマ。決めてある色だけを入れる。
export const THEME = createTheme({
    palette: {
        ...(MAIN   && { primary:   { main: MAIN } }),
        ...(ACCENT && { secondary: { main: ACCENT } }),
        ...(BASE   && { background: { default: BASE } }),
        ...((MAIN || SUB) && {
            text: {
                ...(MAIN && { primary: MAIN }),
                ...(SUB  && { secondary: SUB }),
            },
        }),
        ...(SUB && { divider: SUB }),
    },
});

// CSS の変数。src/ihub/index.css のクラス (theme-color など) が使う。
// 既定の値は src/ihub/index.css の :root にあり、決めてある色だけを上書きする。
export const CSS_VARIABLES = {
    ...(BASE   && { '--ihub-color-base':   BASE }),
    ...(MAIN   && { '--ihub-color-main':   MAIN }),
    ...(SUB    && { '--ihub-color-sub':    SUB }),
    ...(ACCENT && { '--ihub-color-accent': ACCENT }),
};

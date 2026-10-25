// サイドメニューの色。
// background が null のときは、配色の主の色 (src/config/COLORS.js の main) を使う。
// それも null のときは、@yanqirenshi/menubook の既定の色 (紫 { r: 157, g: 91, b: 139 } の背景に、白い文字) になる。
const ACCOUNT_MENU_COLORS = {
    // 背景の色。{ r, g, b } (0〜255) で書く。
    // 選択中の項目は白い背景になり、この色を文字の色に使う。
    // bokasafn は、配色の補助の色 (青竹色 #7EBEA5) にする。
    background: { r: 126, g: 190, b: 165 },

    // 文字とアイコンの色。CSS の色 ('#2b2b2b' など) で書く。
    // 背景が明るくて、白い文字が読みにくいときにだけ決める。
    // 選択中の項目とページの一覧 (どちらも白い背景) の文字にも使うので、暗い色にする。
    // 決めると、アイコンを白く反転しなくなる。アイコンの色は、ICONS.js の SVG の fill で決まる。(無いときは黒)
    text: null,

    // メニューを開いているときの、アカウントの円 (アバターの周り) の色。CSS の色で書く。
    // null のときは、CSS のクラス pair-color1 の色 (配色の差し色) になる。
    // bokasafn は、差し色 (薄紅) がサイドメニューの背景 (青竹色) と見分けられるので、null にする。
    avatar: null,
};

export default ACCOUNT_MENU_COLORS;

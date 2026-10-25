// アプリの配色。
// 4 つの色を、CSS の色 ('#rrggbb') で書く。
// null のときは、それぞれの部品のこれまでの色になる。
//
// どこに使うか (src/ihub/manegers/colors.js)
//   base:   画面の背景、CSS のクラス theme-color1〜5
//   main:   文字、MUI の primary、ドックのボタンと吹き出しの枠、サイドメニューの背景、CSS のクラス text-color1
//   sub:    補助の文字 (MUI の text.secondary)、区切りの線、CSS のクラス text-color2
//   accent: 差し色 (MUI の secondary)、CSS のクラス pair-color1〜5
//
// サイドメニューの色は、src/config/ACCOUNT_MENU_COLORS.js で決めたときは、そちらを使う。
//
// bokasafn の配色は「桜と竹」(春らしいやわらかな配色)。
const COLORS = {
    // 地の色。桜色
    base: '#FEF4F4',

    // 主の色。墨色
    main: '#595857',

    // 補助の色。青竹色
    sub: '#7EBEA5',

    // 差し色。薄紅
    accent: '#F0908D',
};

export default COLORS;

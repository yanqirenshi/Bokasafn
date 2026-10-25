import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

import Section01 from './Help/Section01.js';
import Section02 from './Help/Section02.js';
import Section03 from './Help/Section03.js';

export default function Help () {
    const size = calSize(window.innerWidth, window.innerHeight);

    const options = {
        direction: 'ttb',
        height: '100vh',
        wheel: true,
    };

    return (
        <Splide options={options}
                aria-label="React Splide Example">

          <SplideSlide>
            <Section01 size={size}/>
          </SplideSlide>

          <SplideSlide>
            <Section02 size={size}/>
          </SplideSlide>

          <SplideSlide>
            <Section03 size={size}/>
          </SplideSlide>

        </Splide>
    );
}

function calSize (w, h) {
    // 19.5:9
    if (w < h) {
        const tmp_h = (9/19.5) * h;

        if (tmp_h < h)
            return {
                w: tmp_h,
                h: h,
            };

        return {
            w: (19.5/9) * h,
            h: h,
        };
    } else {
        const tmp_w = (19.5/9) * h;

        if (tmp_w < w)
            return {
                w: tmp_w,
                h: h,
            };

        return {
            w: w,
            h: (9/19.5) * w,
        };
    }
};

import { createSlice } from '@reduxjs/toolkit';

import ROOTS from '../../../config/OPERATOR_ITEMS.js';

const border_width = 3;

function buildInitial () {
    return {
        initialized: false,
        active: null,
        // ROOTS['a'|'b'|'c'] is shared singleton data — clone rather than mutate in
        // place, since Immer freezes this slice's initial state.
        list: [
            ROOTS['a'],
            ROOTS['b'],
            ROOTS['c'],
        ].map(d=> ({
            ...d,
            size: { w: 55, h: 55 },
            position: { x: null, y: null },
            border: { w: border_width },
            branch: {},
        })),
    };
}

const operatorsSlice = createSlice({
    name: 'operators',
    initialState: buildInitial(),
    reducers: {
        operatorsChanged (state, action) {
            return action.payload;
        },
    },
});

export const { operatorsChanged } = operatorsSlice.actions;
export default operatorsSlice.reducer;

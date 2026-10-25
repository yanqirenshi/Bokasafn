import { createSlice } from '@reduxjs/toolkit';

const windowSlice = createSlice({
    name: 'window',
    initialState: { value: null }, // {w: num, h: num}
    reducers: {
        windowResized (state, action) {
            state.value = action.payload;
        },
    },
});

export const { windowResized } = windowSlice.actions;
export default windowSlice.reducer;

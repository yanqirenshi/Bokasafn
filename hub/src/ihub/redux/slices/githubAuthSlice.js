import { createSlice } from '@reduxjs/toolkit';

const githubAuthSlice = createSlice({
    name: 'githubAuth',
    initialState: {
        value: null, // null | 'STARTED' | true | false
        avatarUrl: null, // ログインした Github アカウントの画像の URL
    },
    reducers: {
        authStarted (state) {
            state.value = 'STARTED';
        },
        authSucceeded (state, action) {
            state.value = true;
            state.avatarUrl = action.payload?.avatarUrl || null;
        },
        authFailed (state) {
            state.value = false;
        },
    },
});

export const { authStarted, authSucceeded, authFailed } = githubAuthSlice.actions;
export default githubAuthSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import sogh from '../../manegers/sogh.js';

export function projectKey (login, number) {
    return `${login}:${number}`;
}

export const fetchProjectV2 = createAsyncThunk('scrumProject/fetchProjectV2', ({login, number})=> {
    return sogh.asyncFetchProjectV2ByUserLoginProjectV2Number(login, number);
});

export const fetchProjectV2Items = createAsyncThunk('scrumProject/fetchProjectV2Items', ({login, number})=> {
    return sogh.asyncFetchProjectV2ItemsByUserLoginProjectV2Number(login, number);
});

const scrumProjectSlice = createSlice({
    name: 'scrumProject',
    initialState: { byKey: {} },
    reducers: {},
    extraReducers: (builder)=> {
        builder
            .addCase(fetchProjectV2.pending, (state, action)=> {
                const key = projectKey(action.meta.arg.login, action.meta.arg.number);
                state.byKey[key] = state.byKey[key] || {};
                state.byKey[key].project = { status: 'loading', error: null, id: null };
            })
            .addCase(fetchProjectV2.fulfilled, (state, action)=> {
                const key = projectKey(action.meta.arg.login, action.meta.arg.number);
                state.byKey[key].project = { status: 'succeeded', error: null, id: action.payload };
            })
            .addCase(fetchProjectV2.rejected, (state, action)=> {
                const key = projectKey(action.meta.arg.login, action.meta.arg.number);
                state.byKey[key].project = { status: 'failed', error: action.error.message, id: null };
            })
            .addCase(fetchProjectV2Items.pending, (state, action)=> {
                const key = projectKey(action.meta.arg.login, action.meta.arg.number);
                state.byKey[key] = state.byKey[key] || {};
                state.byKey[key].items = { status: 'loading', error: null, ids: [] };
            })
            .addCase(fetchProjectV2Items.fulfilled, (state, action)=> {
                const key = projectKey(action.meta.arg.login, action.meta.arg.number);
                state.byKey[key].items = { status: 'succeeded', error: null, ids: action.payload };
            })
            .addCase(fetchProjectV2Items.rejected, (state, action)=> {
                const key = projectKey(action.meta.arg.login, action.meta.arg.number);
                state.byKey[key].items = { status: 'failed', error: action.error.message, ids: [] };
            });
    },
});

export default scrumProjectSlice.reducer;

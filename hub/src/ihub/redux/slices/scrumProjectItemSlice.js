import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import sogh from '../../manegers/sogh.js';

export const fetchIssue = createAsyncThunk('scrumProjectItem/fetchIssue', (id)=> {
    return sogh.asyncFetchIssueByID(id);
});

export const fetchIssueComments = createAsyncThunk('scrumProjectItem/fetchIssueComments', (id)=> {
    return sogh.asyncFetchIssueCommentsByID(id);
});

const scrumProjectItemSlice = createSlice({
    name: 'scrumProjectItem',
    initialState: { byId: {} },
    reducers: {},
    extraReducers: (builder)=> {
        builder
            .addCase(fetchIssue.pending, (state, action)=> {
                const id = action.meta.arg;
                state.byId[id] = state.byId[id] || {};
                state.byId[id].issue = { status: 'loading', error: null, id: null };
            })
            .addCase(fetchIssue.fulfilled, (state, action)=> {
                const id = action.meta.arg;
                state.byId[id].issue = { status: 'succeeded', error: null, id: action.payload };
            })
            .addCase(fetchIssue.rejected, (state, action)=> {
                const id = action.meta.arg;
                state.byId[id].issue = { status: 'failed', error: action.error.message, id: null };
            })
            .addCase(fetchIssueComments.pending, (state, action)=> {
                const id = action.meta.arg;
                state.byId[id] = state.byId[id] || {};
                state.byId[id].comments = { status: 'loading', error: null, ids: [] };
            })
            .addCase(fetchIssueComments.fulfilled, (state, action)=> {
                const id = action.meta.arg;
                state.byId[id].comments = { status: 'succeeded', error: null, ids: action.payload };
            })
            .addCase(fetchIssueComments.rejected, (state, action)=> {
                const id = action.meta.arg;
                state.byId[id].comments = { status: 'failed', error: action.error.message, ids: [] };
            });
    },
});

export default scrumProjectItemSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import sogh from '../../manegers/sogh.js';

export const fetchRepositories = createAsyncThunk('scrum/fetchRepositories', ()=> {
    return sogh.asyncFetchRepositoriesByViewer();
});

export const fetchProjectsV2 = createAsyncThunk('scrum/fetchProjectsV2', ()=> {
    return sogh.asyncFetchProjectsV2ByViewer();
});

const initialFetchState = { status: 'idle', error: null, ids: [] };

const scrumSlice = createSlice({
    name: 'scrum',
    initialState: {
        repositories: { ...initialFetchState },
        projectsV2: { ...initialFetchState },
    },
    reducers: {},
    extraReducers: (builder)=> {
        builder
            .addCase(fetchRepositories.pending, (state)=> {
                state.repositories.status = 'loading';
            })
            .addCase(fetchRepositories.fulfilled, (state, action)=> {
                state.repositories.status = 'succeeded';
                state.repositories.ids = action.payload;
            })
            .addCase(fetchRepositories.rejected, (state, action)=> {
                state.repositories.status = 'failed';
                state.repositories.error = action.error.message;
            })
            .addCase(fetchProjectsV2.pending, (state)=> {
                state.projectsV2.status = 'loading';
            })
            .addCase(fetchProjectsV2.fulfilled, (state, action)=> {
                state.projectsV2.status = 'succeeded';
                state.projectsV2.ids = action.payload;
            })
            .addCase(fetchProjectsV2.rejected, (state, action)=> {
                state.projectsV2.status = 'failed';
                state.projectsV2.error = action.error.message;
            });
    },
});

export default scrumSlice.reducer;

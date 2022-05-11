import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/toolkit';

import type { AppNotifyState } from './types';

export const initialState: AppNotifyState = {
    open: false,
    message: '',
    type: undefined,
};

const notifySlice = createSlice({
    name: 'appNotify',
    initialState,
    reducers: {
        openNotify: (state, action: PayloadAction<Omit<AppNotifyState, 'open'>>) => {
            const { message, type } = action.payload;
            Object.assign(state, { open: true, message, type });
        },
        closeNotify: () => initialState,
    },
});

export const { name, reducer, actions } = notifySlice;

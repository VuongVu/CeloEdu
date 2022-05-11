import { combineReducers } from '@reduxjs/toolkit';

import type { InjectedReducersType } from 'hooks/injectorsEnhancer/types';
import { reducer as notifyReducer } from 'components/base/notify/slice';

export default function createReducer(injectedReducers: InjectedReducersType = {}) {
    return combineReducers({
        appNotify: notifyReducer,
        ...injectedReducers,
    });
}

import { createSlice as createSliceOriginal } from '@reduxjs/toolkit';
import type { SliceCaseReducers, CreateSliceOptions } from '@reduxjs/toolkit';

import type { RootStateKey } from 'store/types';

export function createSlice<State, CaseReducers extends SliceCaseReducers<State>, Name extends RootStateKey>(
    options: CreateSliceOptions<State, CaseReducers, Name>,
) {
    return createSliceOriginal(options);
}

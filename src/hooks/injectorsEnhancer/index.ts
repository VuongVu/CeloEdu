import { useInjectReducer as useReducer, useInjectSaga as useSaga } from 'redux-injectors';

import type { RootStateKey } from 'store/types';

import type { InjectReducerParams, InjectSagaParams } from './types';

export function useInjectReducer<Key extends RootStateKey>(params: InjectReducerParams<Key>) {
    return useReducer(params);
}

export function useInjectSaga(params: InjectSagaParams) {
    return useSaga(params);
}

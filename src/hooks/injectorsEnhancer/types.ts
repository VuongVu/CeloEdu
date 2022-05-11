import type { Reducer, AnyAction } from 'redux';
import type { Saga } from 'redux-saga';
import { SagaInjectionModes } from 'redux-injectors';

import type { RequiredRootState, RootStateKey } from 'store/types';

export type InjectedReducersType = {
    [P in RootStateKey]?: Reducer<RequiredRootState[P], AnyAction>;
};

export interface InjectReducerParams<Key extends RootStateKey> {
    key: Key;
    reducer: Reducer<RequiredRootState[Key], AnyAction>;
}

export interface InjectSagaParams {
    key: RootStateKey | string;
    saga: Saga;
    mode?: SagaInjectionModes;
}

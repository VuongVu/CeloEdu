import type { AppNotifyState } from 'components/base/notify/types';

export interface RootState {
    readonly appNotify: AppNotifyState;
}

export type RequiredRootState = Required<RootState>;

export type RootStateKey = keyof RootState;

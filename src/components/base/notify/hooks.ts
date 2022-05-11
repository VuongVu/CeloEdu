import { useAppDispatch } from 'store';

import type { AppNotifyState } from './types';
import { actions } from './slice';

export function useNotify() {
    const dispatch = useAppDispatch();

    const openNotify = (payload: Omit<AppNotifyState, 'open'>) => dispatch(actions.openNotify(payload));

    const closeNotify = () => dispatch(actions.closeNotify());

    return { openNotify, closeNotify };
}

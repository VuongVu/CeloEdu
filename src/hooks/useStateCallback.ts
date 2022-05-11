import { useState, useEffect, useRef, useCallback, type SetStateAction } from 'react';

type Callback<T> = (value: T) => void;
type DispatchWithCallback<T> = (setState: SetStateAction<T>, callback?: Callback<T>) => void;

export default function useStateCallback<T>(initialState: T | (() => T)): [T, DispatchWithCallback<T>] {
    const [state, setState] = useState(initialState);

    const callbackRef = useRef<Callback<T>>();

    const setStateCallback = useCallback((setStateAction: SetStateAction<T>, callback?: Callback<T>): void => {
        callbackRef.current = callback;
        setState(setStateAction);
    }, []);

    useEffect(() => {
        if (callbackRef.current) {
            callbackRef.current?.(state);
            callbackRef.current = undefined;
        }
    }, [state]);

    return [state, setStateCallback];
}

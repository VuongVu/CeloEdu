import { useEffect, useRef } from 'react';

/**
 * Returns the previous value of the given value
 *
 * @see https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 */
export default function usePreviousValue(value: any): any {
    const ref = useRef<any>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

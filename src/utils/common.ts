import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';

export const isServer = typeof window === 'undefined';
export const isBrowser = typeof window !== 'undefined';

export const isBlank = (value: any): boolean => isNil(value) || isNaN(value) || (isEmpty(value) && !isNumber(value));

export const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

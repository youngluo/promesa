export const isObject = (obj: any) => Object.prototype.toString.call(obj) === '[object Object]';

export const isFunction = (obj: any) => typeof obj === 'function';

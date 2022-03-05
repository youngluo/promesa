export const isObject = (obj: any) => typeof obj === 'object'

export const isFunction = (obj: any) => typeof obj === 'function'

export const isIterator = (obj: any) => isFunction(obj[Symbol.iterator])

import { isObject, isFunction } from './util'

type Value = any

type Reason = any

type Resolve = (value?: Value) => Value

type Reject = (reason?: Reason) => Reason

type Executor = (resolve: Resolve, reject: Reject) => void

type Noop = () => void

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

function resolvePromise(promise2: Promesa, x: any, resolve: Resolve, reject: Reject) {
  /**
   * 2.3.1
   * If promise and x refer to the same object, reject promise with a TypeError as the reason.
   */
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle detected for promise!'))
    /**
     * 2.3.2
     * If x is a promise, adopt its state
     */
  } else if (isObject(x) || isFunction(x)) {
    /**
     * 2.3.3.3.3
     * If both resolvePromise and rejectPromise are called,
     * or multiple calls to the same argument are made,
     * the first call takes precedence, and any further calls are ignored.
     */
    let called = false
    try {
      /**
       * 2.3.3.1
       * Let then be x.then.
       */
      const { then } = x
      /**
       * 2.3.3.3
       * If then is a function, call it with x as this,
       * first argument resolvePromise, and second argument rejectPromise
       */
      if (isFunction(then)) {
        then.call(
          x,
          /**
           * 2.3.3.3.1
           * If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
           */
          (y: Value) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          /**
           * 2.3.3.3.2
           * If/when rejectPromise is called with a reason r, reject promise with r.
           */
          (e: Reason) => {
            if (called) return
            called = true
            reject(e)
          }
        )
      } else {
        /**
         * 2.3.3.4
         * If then is not a function, fulfill promise with x.
         */
        resolve(x)
      }
    } catch (e) {
      /**
       * 2.3.3.2
       * If retrieving the property x.then results in a thrown exception e,
       * reject promise with e as the reason.
       * 2.3.3.3.4.2
       * If calling then throws an exception e,
       * reject promise with e as the reason.
       */
      if (called) return
      called = true
      reject(e)
    }
  } else {
    /**
     * 2.3.4
     * If x is not an object or function, fulfill promise with x.
     */
    resolve(x)
  }
}

export class Promesa {
  state = PENDING

  reason: Reason

  value: Value

  resolvedCallbacks: Noop[] = []

  rejectedCallbacks: Noop[] = []

  constructor(executor: Executor) {
    const resolve = (value?: Value) => {
      if (this.state !== PENDING) return
      this.state = FULFILLED
      this.value = value
      this.resolvedCallbacks.forEach((fn) => fn())
    }
    const reject = (reason?: Reason) => {
      if (this.state !== PENDING) return
      this.state = REJECTED
      this.reason = reason
      this.rejectedCallbacks.forEach((fn) => fn())
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  /**
   * 2.2.1
   * Both onFulfilled and onRejected are optional arguments.
   */
  then(onFulfilled?: Resolve, onRejected?: Reject) {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (v) => v
    onRejected = isFunction(onRejected)
      ? onRejected
      : (e) => {
          throw e
        }

    const promise2 = new Promesa((resolve, reject) => {
      const onFulfilledExecutor = () => {
        setTimeout(() => {
          try {
            /**
             * 2.2.7.3
             * If onFulfilled is not a function and promise1 is fulfilled,
             * promise2 must be fulfilled with the same value as promise1.
             * 2.2.7.1
             * If either onFulfilled or onRejected returns a value x,
             * run the Promise Resolution Procedure [[Resolve]](promise2, x).
             */
            const x = onFulfilled!(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            /**
             * 2.2.7.2
             * If either onFulfilled or onRejected throws an exception e,
             * promise2 must be rejected with e as the reason.
             */
            reject(e)
          }
        }, 0)
      }

      const onRejectedExecutor = () => {
        setTimeout(() => {
          try {
            /**
             * 2.2.7.1
             */
            const x = onRejected!(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            /**
             * 2.2.7.2
             * 2.2.7.4
             * If onRejected is not a function and promise1 is rejected,
             * promise2 must be rejected with the same reason as promise1.
             * catch the “throw e” if onRejected is not a function
             */
            reject(e)
          }
        }, 0)
      }

      if (this.state === FULFILLED) onFulfilledExecutor()
      if (this.state === REJECTED) onRejectedExecutor()
      if (this.state === PENDING) {
        this.resolvedCallbacks.push(onFulfilledExecutor)
        this.rejectedCallbacks.push(onRejectedExecutor)
      }
    })

    // 2.2.7 then must return a promise.
    return promise2
  }

  catch(onRejected?: Reject) {
    return this.then(undefined, onRejected)
  }

  finally(callback: () => void) {
    if (!isFunction(callback)) return this.then(callback, callback)
    return this.then(
      (value) => Promesa.resolve(callback()).then(() => value),
      (reason) =>
        Promesa.resolve(callback()).then(() => {
          throw reason
        })
    )
  }

  static resolve(value?: Value) {
    if (value instanceof Promesa) return value
    return new Promesa((resolve) => {
      if (isObject(value) && isFunction(value.then)) {
        value.then(resolve)
      } else {
        resolve(value)
      }
    })
  }

  static reject(reason?: Reason) {
    return new Promesa((_resolve, reject) => {
      reject(reason)
    })
  }

  static all<T>(promises?: Array<T>) {
    if (!Array.isArray(promises)) {
      throw new TypeError(
        `${typeof promises} ${promises} is not iterable (cannot read property Symbol(Symbol.iterator)).`
      )
    }
    // 此时表现为同步
    if (promises.length === 0) return Promesa.resolve(promises)

    return new Promesa((resolve, reject) => {
      const values: Value[] = []
      const size = promises.length
      let count = 0
      for (let i = 0; i < promises.length; i++) {
        Promesa.resolve(promises[i])
          .then((value) => {
            values[i] = value
            if (++count === size) resolve(values)
          })
          .catch(reject)
      }
    })
  }

  static race<T>(promises?: Array<T>) {
    if (!Array.isArray(promises)) {
      throw new TypeError(
        `${typeof promises} ${promises} is not iterable (cannot read property Symbol(Symbol.iterator)).`
      )
    }

    return new Promesa((resolve, reject) => {
      for (const promise of promises!) {
        Promesa.resolve(promise).then(resolve, reject)
      }
    })
  }
}

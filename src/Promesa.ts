/* eslint-disable no-underscore-dangle */
import { isObject, isFunction } from './util';

const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

type Value = any

type Reason = any

type Resolve = (value: Value) => void

type Reject = (reason?: Reason) => void

type Executor = (resolve: Resolve, reject: Reject) => void

type Noop = () => void

export class Promesa {
  state = PENDING

  reason: Reason

  value: Value

  resolvedCallbacks: Noop[] = []

  rejectedCallbacks: Noop[] = []

  constructor(executor: Executor) {
    const resolve = (value: Value) => {
      if (this.state !== PENDING) return;
      this.state = FULFILLED;
      this.value = value;
      // 依次执行 resolved 回调
      this.resolvedCallbacks.forEach((fn) => fn());
    };
    const reject = (reason?: Reason) => {
      if (this.state !== PENDING) return;
      this.state = REJECTED;
      this.reason = reason;
      // 依次执行 rejected 回调
      this.rejectedCallbacks.forEach((fn) => fn());
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 2.2.1
   * Both onFulfilled and onRejected are optional arguments.
   */
  then(onFulfilled?: Resolve, onRejected?: Reject) {
    const promise2 = new Promesa((resolve, reject) => {
      if (this.state === FULFILLED) {
        try {
          if (!isFunction(onFulfilled)) {
            /**
             * 2.2.7.3
             * If onFulfilled is not a function and promise1 is fulfilled,
             * promise2 must be fulfilled with the same value as promise1.
             */
            resolve(this.value);
          } else {
            /**
             * 2.2.7.1
             * If either onFulfilled or onRejected returns a value x,
             * run the Promise Resolution Procedure [[Resolve]](promise2, x).
             */
            const x = onFulfilled!(this.value);
            this._resolvePromise(promise2, x, resolve, reject);
          }
        } catch (e) {
          /**
           * 2.2.7.2
           * If either onFulfilled or onRejected throws an exception e,
           * promise2 must be rejected with e as the reason.
           */
          reject(e);
        }
      }

      if (this.state === REJECTED) {
        try {
          if (!isFunction(onRejected)) {
            /**
             * 2.2.7.4
             * If onRejected is not a function and promise1 is rejected,
             * promise2 must be rejected with the same reason as promise1.
             */
            reject(this.reason);
          } else {
            // 2.2.7.1
            const x = onRejected!(this.reason);
            this._resolvePromise(promise2, x, resolve, reject);
          }
        } catch (e) {
          // 2.2.7.2
          reject(e);
        }
      }

      if (this.state === PENDING) {
        if (isFunction(onFulfilled)) {
          this.resolvedCallbacks.push(() => {
            try {
              const x = onFulfilled!(this.value);
              this._resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }

        if (isFunction(onRejected)) {
          this.rejectedCallbacks.push(() => {
            try {
              const x = onRejected!(this.reason);
              this._resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }
      }
    });

    // 2.2.7 then must return a promise.
    return promise2;
  }

  _resolvePromise(promise2: Promesa, x: any, resolve: Resolve, reject: Reject) {
    /**
     * 2.3.1
     * If promise and x refer to the same object, reject promise with a TypeError as the reason.
     */
    if (promise2 === x) {
      reject(new TypeError('Chaining cycle detected for promise!'));
      /**
       * 2.3.2
       * If x is a promise, adopt its state
       */
    } else if (x instanceof Promesa) {
      /**
       * 2.3.2.1
       * If x is pending, promise must remain pending until x is fulfilled or rejected.
       */
      if (x.state === PENDING) {
        x.then(
          (value) => { this._resolvePromise(promise2, value, resolve, reject); },
          reject,
        );
      } else {
        /**
         * 2.3.2.2
         * If/when x is fulfilled, fulfill promise with the same value.
         * 2.3.2.3
         * If/when x is rejected, reject promise with the same reason.
         */
        x.then(resolve, reject);
      }
      /**
       * 2.3.3
       * if x is an object or function
       */
    } else if (isObject(x) || isFunction(x)) {
      /**
       * 2.3.3.3.3
       * If both resolvePromise and rejectPromise are called,
       * or multiple calls to the same argument are made,
       * the first call takes precedence, and any further calls are ignored.
       */
      let called = false;
      try {
        /**
         * 2.3.3.1
         * Let then be x.then.
         */
        const { then } = x;
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
              if (called) return;
              called = true;
              this._resolvePromise(promise2, y, resolve, reject);
            },
            /**
             * 2.3.3.3.2
             * If/when rejectPromise is called with a reason r, reject promise with r.
             */
            (e: Reason) => {
              if (called) return;
              called = true;
              reject(e);
            },
          );
        } else {
          /**
           * 2.3.3.4
           * If then is not a function, fulfill promise with x.
           */
          resolve(x);
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
        reject(e);
      }
    } else {
      /**
       * 2.3.4
       * If x is not an object or function, fulfill promise with x.
       */
      resolve(x);
    }
  }

  // catch() {

  // }

  // finally() {

  // }

  // static all() {

  // }

  // static race() {

  // }
}

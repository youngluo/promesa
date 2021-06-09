/* eslint-disable no-underscore-dangle */
import { isObject, isFunction } from './util';

const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

type Value = any

type Reason = any

type Resolve = (value: Value) => void

type Reject = (reason?: Reason) => void

type Executor = (resolve?: Resolve, reject?: Reject) => void

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

  then(onFulfilled?: Resolve, onRejected?: Reject) {
    if (typeof onFulfilled === 'function') {
      if (this.state === FULFILLED) {
        onFulfilled(this.value);
      }

      if (this.state === PENDING) {
        this.resolvedCallbacks.push(() => {
          onFulfilled(this.value);
        });
      }
    }

    if (typeof onRejected === 'function') {
      if (this.state === REJECTED) {
        onRejected(this.reason);
      }

      if (this.state === PENDING) {
        this.rejectedCallbacks.push(() => {
          onRejected(this.reason);
        });
      }
    }
  }

  // eslint-disable-next-line consistent-return
  _resolvePromise(promise2: Promesa, x: any, resolve: Resolve, reject: Reject) {
    // 2.3.1，x 不能和 promise2 相同，避免循环引用
    if (promise2 === x) return reject(new TypeError('Chaining cycle detected for promise!'));
    if (x instanceof Promesa) {
      // 2.3.2.1 如果 x 为 pending 状态，promise2 必须保持 pending 状态，直到 x 为 fulfilled/rejected
      if (x.state === PENDING) {
        x.then((value) => {
          this._resolvePromise(promise2, value, resolve, reject);
        }, reject);
      } else {
        x.then(resolve, reject);
      }
    } else if (isObject(x) || isFunction(x)) {
      // 2.3.3.3.3
      let called = false;
      try {
        // 2.3.3.1
        const { then } = x;
        // 2.3.3.3，如果 then 是函数，用 x 作为 this 调用 then
        if (isFunction(then)) {
          then.call(
            x,
            // 2.3.3.3.1
            (y: Value) => {
              if (called) return;
              called = true;
              this._resolvePromise(promise2, y, resolve, reject);
            },
            // 2.3.3.3.2
            (e: Reason) => {
              if (called) return;
              called = true;
              reject(e);
            },
          );
        } else {
          // 2.3.3.4
          resolve(x);
        }
      } catch (e) {
        // 2.3.3.2 如果读取 then 异常，则 reject
        // 2.3.3.3.4.2
        reject(e);
      }
    } else {
      // 2.3.4
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

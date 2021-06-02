const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

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
  onResolvedCallbacks: Noop[] = []
  onRejectedCallbacks: Noop[] = []

  constructor(executor: Executor) {
    const resolve = (value: Value) => {
      if (this.state !== PENDING) return
      this.state = FULFILLED
      this.value = value
      // 依次执行 resolved 回调
      this.onResolvedCallbacks.forEach(fn => fn())
    }

    const reject = (reason?: Reason) => {
      if (this.state !== PENDING) return
      this.state = REJECTED
      this.reason = reason
      // 依次执行 rejected 回调
      this.onRejectedCallbacks.forEach(fn => fn())
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled?: Resolve, onRejected?: Reject) {
    if (typeof onFulfilled === 'function') {
      if (this.state === FULFILLED) {
        onFulfilled(this.value)
      }

      if (this.state === PENDING) {
        this.onResolvedCallbacks.push(() => {
          onFulfilled(this.value)
        })
      }
    }

    if (typeof onRejected === 'function') {
      if (this.state === REJECTED) {
        onRejected(this.reason)
      }

      if (this.state === PENDING) {
        this.onResolvedCallbacks.push(() => {
          onRejected(this.reason)
        })
      }
    }
  }

  catch() {

  }

  finally() {

  }

  static all() {

  }

  static race() {

  }
}

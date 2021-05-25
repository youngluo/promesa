const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class Promesa {
  state = PENDING
  value: any = ''
  reason = ''

  constructor(executor) {
    const resolve = (value: any) => {
      if (this.state === PENDING) {
        this.state = FULFILLED
        this.value = value
      }
    }

    const reject = (reason: any) => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === FULFILLED) {
      onFulfilled(this.value)
    }

    if (this.state === REJECTED) {
      onRejected(this.reason)
    }
  }

  catch() {

  }

  finally() {

  }

  deferred() {
    const result = {};
    result.promise = new Promesa((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
    });

    return result;
  }

  static all() {

  }

  static race() {

  }
}

export default Promesa
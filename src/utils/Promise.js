class Promise {
  static PENDING = 'pending'
  static RESOLVED = 'resolved'
  static REJECTED = 'rejected'

  static resolve (value) {
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  constructor (executor) {
    this.state = Promise.PENDING
    this.value = undefined
    this.reason = undefined

    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }

      if (this.state === Promise.PENDING) {
        this.state = Promise.RESOLVED
        this.value = value
        this.onResolvedCallbacks.forEach((fn) => fn())
      }
    }

    const reject = (reason) => {
      this.state = Promise.REJECTED
      this.reason = reason
      this.onRejectedCallbacks.forEach((fn) => fn())
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    let promise = new Promise((resolve, reject) => {
      if (this.state === Promise.PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      if (this.state === Promise.RESOLVED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === Promise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
    });

    return promise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  all(arr) {
    let count = 0;
    let result = [];

    return new Promise((resolve, reject) => {
      for (let i = 0; i < arr.length; i++) {
        Promise.resolve(arr[i])
          .then((res) => {
            result[i] = res;
            if (++count === arr.length) {
              resolve(res);
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  race(arr) {
    return new Promise((resolve, reject) => {
      arr.forEach((item) => Promise.resolve(item).then(resolve, reject));
    });
  }

  finally(callback) {
    return this.then(
      (value) => {
        return Promise.resolve(callback()).then(() => value);
      },
      (reason) => {
        return Promise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }

  allSettled(arr) {
    let count = 0;
    let result = [];

    return new Promise((resolve, reject) => {
      const fn = (i, data) => {
        if (count === arr.length) {
          resolve(result);
        }

        result[i] = data;
        count++;
      };

      for (let i = 0; i < arr.length; i++) {
        Promise.resolve(arr[i])
          .then((res) => {
            fn(i, { status: "fulfilled", value: res });
          })
          .catch((error) => {
            fn(i, { status: "rejected", reason: error });
          });
      }
    });
  }

  // from Node Util.promisify
  promisify(f) {
    return function (...args) {
      return new Promise((resolve, reject) => {
        function callback(error, result) {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }

        args.push(callback);

        f.call(this, ...args);
      });
    };
  }

  // from Node Util.promisifyAll
  promisifyAll(obj) {
    for (let key in obj) {
      if (typeof obj[key] === "function") {
        obj[key] = this.promisify(obj[key]);
      }
    }
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // let promise = new Promise((resolve) => {
  //   resolve(1);
  // }).then((res) => {
  //   return promise;
  // });

  if (x === promise) {
    throw TypeError("循环引用");
  }

  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    let called;

    try {
      let then = x.then;

      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // x: { then: {} }
        if (called) return;
        called = true;
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 返回了常量，直接 resolve
    resolve(x);
  }
}

const p = new Promise((resolve, reject) => {
  reject(1);
});

p.catch((error) => {
  console.log("error + ", error);
  return error;
}).then((res) => {
  console.log(res);
});

Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
}
module.exports = Promise

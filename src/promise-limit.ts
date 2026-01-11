// Source: https://github.com/featurist/promise-limit/blob/master/index.js

function limiter (count) {
  var outstanding = 0
  var jobs = []

  function remove () {
    outstanding--

    if (outstanding < count) {
      dequeue()
    }
  }

  function dequeue () {
    var job = jobs.shift()
    semaphore.queue = jobs.length

    if (job) {
      run(job.fn).then(job.resolve).catch(job.reject)
    }
  }

  function queue (fn) {
    return new Promise(function (resolve, reject) {
      jobs.push({fn: fn, resolve: resolve, reject: reject})
      semaphore.queue = jobs.length
    })
  }

  function run (fn) {
    outstanding++
    try {
      return Promise.resolve(fn()).then(function (result) {
        remove()
        return result
      }, function (error) {
        remove()
        throw error
      })
    } catch (err) {
      remove()
      return Promise.reject(err)
    }
  }

  var semaphore = function (fn) {
    if (outstanding >= count) {
      return queue(fn)
    } else {
      return run(fn)
    }
  }

  return semaphore
}

function map (items, mapper) {
  var failed = false

  var limit = this

  return Promise.all(items.map(function () {
    var args = arguments
    return limit(function () {
      if (!failed) {
        return mapper.apply(undefined, args).catch(function (e) {
          failed = true
          throw e
        })
      }
    })
  }))
}

function addExtras (fn) {
  fn.queue = 0
  fn.map = map
  return fn
}

module.exports = function (count) {
  if (count) {
    return addExtras(limiter(count))
  } else {
    return addExtras(function (fn) {
      return fn()
    })
  }
}


/// type declare ///
// export = limitFactory

// declare namespace limitFactory {}

/**
 * Returns a function that can be used to wrap promise returning functions,
 * limiting them to concurrency outstanding calls.
 * @param concurrency the concurrency, i.e. 1 will limit calls to one at a
 * time, effectively in sequence or serial. 2 will allow two at a time, etc.
 * 0 or undefined specify no limit, and all calls will be run in parallel.
 */
// declare function limitFactory<T>(concurrency?: number): limit<T>

// declare type limit<T> = limitFunc<T> & limitInterface<T>

// declare interface limitInterface<T> {
  /**
   * Maps an array of items using mapper, but limiting the number of concurrent
   * calls to mapper with the concurrency of limit. If at least one call to
   * mapper returns a rejected promise, the result of map is a the same rejected
   * promise, and no further calls to mapper are made.
   * @param items any items
   * @param mapper iterator
   */
  // map<U>(items: ReadonlyArray<T>, mapper: (value: T) => Promise<U>): Promise<U[]>

  /**
   * Returns the queue length, the number of jobs that are waiting to be started.
   * You could use this to throttle incoming jobs, so the queue doesn't
   * overwhealm the available memory - for e.g. pause() a stream.
  */
  // queue: number
// }

/**
 * A function that limits calls to fn, based on concurrency above. Returns a
 * promise that resolves or rejects the same value or error as fn. All functions
 * are executed in the same order in which they were passed to limit. fn must
 * return a promise.
 * @param fn a function that is called with no arguments and returns a promise.
 * You can pass arguments to your function by putting it inside another function,
 * i.e. `() -> myfunc(a, b, c)`.
*/
// declare type limitFunc<T> = (fn: () => Promise<T>) => Promise<T>

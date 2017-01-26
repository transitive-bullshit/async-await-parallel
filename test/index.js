const parallel = require('../')
const expect = require('expect.js')

function createResolvedPromise (timeout = 10, result = true) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result)
    }, timeout)
  })
}

function createRejectedPromise (timeout = 10) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('test error'))
    }, timeout)
  })
}

describe('parallelMap', async () => {
  it('basic usage', async () => {
    const input = [
      () => createResolvedPromise(10),
      () => createResolvedPromise(20),
      () => createResolvedPromise(50),
      () => createResolvedPromise(30),
      () => createResolvedPromise(100),
      () => createResolvedPromise(5)
    ]

    const results = await parallel(input, 2)
    expect(results).to.have.length(6)

    // all results should be the resolved value of createResolvedPromise (truthy)
    for (result of results) {
      expect(result).to.be.ok()
    }
  })

  it('ensure max concurrency', async () => {
    const concurrency = 3
    let hitMaxConcurrency = false
    let numActive = 0

    function checkConcurrency () {
      expect(numActive).to.be.greaterThan(0)
      expect(numActive).to.be.lessThan(concurrency + 1)

      if (numActive === concurrency) {
        // we expect the max concurrency to be hit at some point to ensure we're
        // not just executing the tasks serially
        hitMaxConcurrency = true
      }
    }

    function task (timeout = 10, result = true) {
      numActive++

      return new Promise((resolve) => {
        checkConcurrency()

        setTimeout(() => {
          checkConcurrency()
          resolve(result)
        }, timeout)
      }).then((result) => {
        checkConcurrency()
        --numActive

        return result
      })
    }

    const input = [
      async () => task(5),
      () => task(5),
      () => task(5),
      () => task(5),
      () => task(5),
      () => task(5),
      () => task(5),
      async () => task(5),
      () => task(10),
      () => task(20),
      () => task(50),
      () => task(30),
      () => task(100),
      () => task(5),
      () => task(5),
      () => task(5),
      () => task(5),
      async () => task(5),
      async () => task(5),
      async () => task(5),
      async () => task(20),
      () => task(180),
      () => task(5),
      () => task(5)
    ]

    const results = await parallel(input, concurrency)
    expect(results).to.have.length(input.length)
    expect(hitMaxConcurrency).to.be.ok()

    for (result of results) {
      expect(result).to.be.ok()
    }
  })

  it('handle rejections properly', async () => {
    async function expectUnreachable () {
      // this function should never be reached
      expect(false).to.be.ok()
    }

    const input = [
      () => createResolvedPromise(10),
      () => createResolvedPromise(10),
      () => createRejectedPromise(10),
      () => createResolvedPromise(20),

      () => expectUnreachable(),
      () => expectUnreachable(),
      () => expectUnreachable(),
      () => expectUnreachable()
    ]

    let exception

    try {
      const results = await parallel(input, 2)
    } catch (e) {
      exception = e
    }

    expect(exception).to.be.ok()
  })
})

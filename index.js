module.exports = parallelMap
module.exports.pool = parallelPool

async function parallelMap (thunks, concurrency = 5) {
  if (concurrency > 0) {
    concurrency = Math.min(concurrency, thunks.length)
  } else {
    concurrency = thunks.length
  }

  let index = 0
  let results = [ ]

  await parallelPool(concurrency, async () => {
    if (index < thunks.length) {
      const currentIndex = index++
      const thunk = thunks[currentIndex]
      results[currentIndex] = await thunks[currentIndex].call(this)
    }

    return (index < thunks.length)
  })

  return results
}

async function parallelPool (size, task) {
  let done = false
  let active = 0
  let errors = [ ]

  return new Promise((resolve, reject) => {
    function poolIterator () {
      while (active < size && !done) {
        active++

        task()
          .then((more) => {
            if (--active <= 0 && (done || !more)) {
              if (!errors.length) {
                return resolve()
              } else {
                return reject(new Error(errors))
              }
            } else if (more) {
              poolIterator()
            } else {
              done = true
            }
          })
          .catch((err) => {
            errors.push(err)
            done = true
            if (--active <= 0) {
              return reject(new Error(errors))
            }
          })
      }
    }

    poolIterator()
  })
}

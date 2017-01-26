# async-await-parallel

This npm module provides a simple utility for elegantly limiting the concurrency of `await`ing over arrays of async results in ES7.

### Background

Normally, when you have an array of `async` operations that you want to `await` on, you have to use `Promise.all`.

```javascript
await Promise.all([
  async () => { ... },
  async () => { ... },
  async () => { ... },
  async () => { ... },
  async () => { ... },
])
```

Unfortunately, there's nothing built into ES7's implementation of `async` `await` that allows you to limit the concurrency of how many async handlers are running at once.

This is problematic in many common scenarios such as performing operations on each file in a directory or downloading a batch of URLs without opening too many sockets or clogging IO bandwidth.

### Usage

`async-await-parallel` allows you to set a maximum concurrency for an array of async results you want to `await` on.

```javascript
const parallel = require('async-await-parallel')

await parallel([
  async () => { ... },
  async () => { ... },
  async () => { ... },
  async () => { ... },
  async () => { ... },
], 2)
```

In this example, a max concurrency of 2 is set, so not more than 2 of the async functions may be executing at any given time. Async functions will be executed in order once previous ones resolve.

### Installation

```
npm install async-await-parallel
```

### Inspiration

* [async.mapLimit](http://caolan.github.io/async/) equivalent functionality for callbacks
* [co-parallel](https://github.com/tj/co-parallel) equivalent functionality for co generators
* [async-parallel](https://github.com/davetemplin/async-parallel) this library is heavily inspired by this TypeScript library for async / await by Dave Templin (simplified, converted from TS to ES, and added tests)

### License

MIT. Copyright (c) 2017 [Vidy](https://vidy.com).

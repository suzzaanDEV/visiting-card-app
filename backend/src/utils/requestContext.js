const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

module.exports = {
  // Run an Express request inside a fresh context store.
  run(store, fn) {
    return storage.run(store, fn);
  },
  // Read the current request's context (empty object when none).
  get() {
    return storage.getStore() || {};
  }
};
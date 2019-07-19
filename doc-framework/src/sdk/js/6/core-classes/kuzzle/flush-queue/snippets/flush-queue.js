try {
  kuzzle.flushQueue();

  console.log('Offline queue flushed');
} catch (error) {
  console.error(error);
}

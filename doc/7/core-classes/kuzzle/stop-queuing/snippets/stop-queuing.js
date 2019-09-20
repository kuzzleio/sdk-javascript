try {
  kuzzle.stopQueuing();

  console.log('Stop queuing requests');
} catch (error) {
  console.error(error);
}

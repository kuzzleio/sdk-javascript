try {
  kuzzle.startQueuing();

  console.log('Start queuing requests');
} catch (error) {
  console.error(error);
}

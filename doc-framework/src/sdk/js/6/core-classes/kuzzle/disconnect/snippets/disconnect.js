try {
  kuzzle.disconnect();

  console.log('Successfully disconnected');
} catch (error) {
  console.error(error);
}

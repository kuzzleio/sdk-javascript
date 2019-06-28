try {
  await kuzzle.connect();

  console.log('Successfully connected');
} catch (error) {
  console.error(error.message);
}

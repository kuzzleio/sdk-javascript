try {
  await kuzzle.ms.flushdb();
  console.log('Success');
} catch (error) {
  console.error(error.message);
}

try {
  const size = await kuzzle.ms.dbsize();
  console.log('Success');
} catch (error) {
  console.error(error.message);
}

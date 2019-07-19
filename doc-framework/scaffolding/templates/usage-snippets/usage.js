try {
  await kuzzle.<%= _.camelCase(controller) %>.<%= _.camelCase(action) %>();
  console.log('Success');
} catch (error) {
  console.error(error.message);
}

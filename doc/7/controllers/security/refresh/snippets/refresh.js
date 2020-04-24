try {
  await kuzzle.security.refresh('users');
  console.log('Success');
} catch (e) {
  console.error(e);
}
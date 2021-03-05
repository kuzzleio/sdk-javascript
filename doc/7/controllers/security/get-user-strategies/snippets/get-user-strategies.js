try {
  const response = await kuzzle.security.getUserStrategies('john.doe');

  console.log(response);
  /*
  [ 'local' ]
   */
} catch (e) {
  console.error(e);
}

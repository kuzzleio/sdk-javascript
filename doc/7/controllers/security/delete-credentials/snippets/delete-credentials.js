try {
  const response = await kuzzle.security.deleteCredentials('local', 'john.doe');
  console.log(response);
  /*
  { acknowledged: true }
   */

  console.log('Credentials successfully deleted');
} catch (e) {
  console.error(e);
}

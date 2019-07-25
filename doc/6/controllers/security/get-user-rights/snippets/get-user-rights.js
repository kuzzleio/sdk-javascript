try {
  const response = await kuzzle.security.getUserRights('john.doe');

  console.log(response);
  /*
  [ { controller: '*',
      action: '*',
      index: '*',
      collection: '*',
      value: 'allowed' } ]
   */
} catch (e) {
  console.error(e);
}

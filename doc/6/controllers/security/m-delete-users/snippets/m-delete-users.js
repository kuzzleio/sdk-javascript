try {
  const response = await kuzzle.security.mDeleteUsers([
    'user1',
    'user2',
    'user3'
  ]);

  console.log(response);
  /*
  [ 'user1', 'user2', 'user3' ]
   */
} catch (e) {
  console.error(e);
}

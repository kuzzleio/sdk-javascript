try {
  const response = await kuzzle.security.mGetUsers([
    'user1',
    'user2',
    'user3'
  ]);

  console.log(response);
  /*
  [ User {
      _id: 'user1',
      profileIds: ['profile1'],
    User {
      _id: 'user2',
      profileIds: ['profile2'],
    User {
      _id: 'user3',
      profileIds: ['profile3'] ]
   */
} catch (e) {
  console.error(e);
}

try {
  const response = await kuzzle.security.mDeleteProfiles([
    'profile1',
    'profile2',
    'profile3',
    'profile4',
    'profile5'
  ]);

  console.log(response);
  /*
  [ 'profile1', 'profile2', 'profile3', 'profile4', 'profile5' ]
   */
} catch (e) {
  console.error(e);
}

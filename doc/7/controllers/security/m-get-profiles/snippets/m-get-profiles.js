try {
  const response = await kuzzle.security.mGetProfiles([
    'profile1',
    'profile2',
    'profile3'
  ]);

  console.log(`Successfully retrieved ${response.length} profiles`);
  /*
  [ Profile {
      _id: 'profile1',
      policies: [ [Object] ] },
    Profile {
      _id: 'profile2',
      policies: [ [Object] ] },
    Profile {
      _id: 'profile3';
      policies: [ [Object] ] } ]
   */
} catch (e) {
  console.error(e);
}

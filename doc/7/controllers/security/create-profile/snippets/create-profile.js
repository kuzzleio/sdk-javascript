try {
  const response = await kuzzle.security.createProfile(
    'myProfile',
    {
      policies: [
        {
          roleId: 'default'
        },
        {
          roleId: 'admin',
          restrictedTo: [
            {
              index: 'someindex',
              collections: [
                'collection1',
                'collection2'
              ]
            }
          ]
        }
      ]
    }
  );
  console.log(response);

  /*
  Profile {
    _id: 'myProfile',
    policies:
      [ { roleId: 'default' },
        { roleId: 'admin', restrictedTo: [Array] } ] }
  */

  console.log('Profile successfully created');
} catch (e) {
  console.error(e);
}

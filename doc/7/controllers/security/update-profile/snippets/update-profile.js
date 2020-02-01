try {
  const response = await kuzzle.security.updateProfile(
    'myProfile',
    {
      policies: [
        {
          roleId: 'default'
        },
        {
          roleId: 'privileged',
          restrictedTo: [
            {
              index: 'someindex'
            },
            {
              index: 'anotherindex',
              collections: [
                'coll1',
                'coll2'
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
        { roleId: 'privileged',
          restrictedRo:
            [ { index: 'someIndex' },
              { index: 'anotherIndex', collections: [ 'coll1', 'coll2' ]  } ] } ]
   */

} catch (e) {
  console.error(e);
}

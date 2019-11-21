try {
  const response = await kuzzle.security.getProfile('myProfile');

  console.log(response);
  /*
  Profile {
    _id: 'myProfile',
    policies:
      [ { roleId: 'admin',
          restrictedTo:
            [ { index: 'someIndex' },
              { index: 'anotherIndex', collections: [ 'someCollection' ] } ] },
        { roleId: 'default' } ] }
   */
} catch (e) {
  console.error(e);
}

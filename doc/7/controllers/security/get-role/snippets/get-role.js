try {
  const response = await kuzzle.security.getRole('myRole');

  console.log(response);
  /*
  Role {
    _id: 'myRole',
    controllers:
      { auth:
        { actions: { login: true, getMyRights: true, updateSelf: true } },
        document: { actions: { get: true, search: true } } } }
  */
} catch (e) {
  console.error(e);
}

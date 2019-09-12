try {
  const response = await kuzzle.security.updateRole('read-only', {
    controllers: {
      auth: {
        actions: {
          getCurrentUser: true,
          getMyCredentials: true,
          getMyRights: true,
          logout: true
        }
      },
      collection: {
        actions: {
          getMapping: true,
          list: true
        }
      },
      document: {
        actions: {
          count: true,
          get: true,
          mGet: true,
          scroll: true,
          search: true
        }
      },
      index: {
        actions: {
          list: true
        }
      }
    }
  });

  console.log(response);
  /*
  Role {
    _id: 'read-only',
    controllers:
      { auth: { actions: [Object] },
        collection: { actions: [Object] },
        document: { actions: [Object] },
        index: { actions: [Object] }  } }
   */

} catch (e) {
  console.error(e);
}

try {
  const results = await kuzzle.security.searchRoles({
    controllers: ['auth']
  });

  console.log(results);
  /*
  RoleSearchResult {
    aggregations: undefined,
    hits:
      [ Role { _id: 'admin', controllers: [Object] },
        Role { _id: 'default', controllers: [Object] },
        Role { _id: 'anonymous', controllers: [Object] } ]
    fetched: 3,
    total: 3 }
   */

  console.log(`Successfully retrieved ${results.total} roles`);
} catch (e) {
  console.error(e);
}

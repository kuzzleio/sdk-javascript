try {
  const results = await kuzzle.security.searchUsers({
      term: {
        status: 'student'
      }
  });

  console.log(results);
  /*
  UserSearchResult {
    aggregations: undefined,
    hits:
     [ User { _kuzzle: [Kuzzle], _id: 'user2', content: [Object] },
       User { _kuzzle: [Kuzzle], _id: 'user1', content: [Object] },
       User { _kuzzle: [Kuzzle], _id: 'user3', content: [Object] } ],
    fetched: 3,
    total: 3 }
   */

  console.log(`Successfully retrieved ${results.total} users`);
} catch (e) {
  console.error(e);
}

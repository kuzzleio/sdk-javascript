try {
  const results = await kuzzle.security.searchProfiles({
    query: {
      term: { 'policies.roleId': 'default' }
    }
  });

  console.log(results);
  /*
  ProfileSearchResult { aggregations: undefined,
    hits:
      [ Profile { _id: 'profile1', policies: [Array] },
        Profile { _id: 'profile2', policies: [Array] },
        Profile { _id: 'profile3', policies: [Array] },
        Profile { _id: 'default', policies: [Array] } ],
    fetched: 4,
    total: 4 }
   */

  console.log(`Successfully retrieved ${results.total} profiles`);
} catch (e) {
  console.error(e);
}

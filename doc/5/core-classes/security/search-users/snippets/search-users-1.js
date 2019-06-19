const filter = {
  bool: {
    must: [
      {
        terms: {
          profileIds: ['anonymous', 'default']
        }
      },
      {
        geo_distance: {
          distance: '10km',
          pos: {
            lat: 48.8566140,
            lon: 2.352222
          }
        }
      }
    ]
  }
};

// optional: result pagination configuration
const options = {
  from: 0,
  size: 10,
  scroll: '1m'
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .searchUsers(filters, options, function(error, result) {
    // result is a JSON Object with the following properties:
    // {
    //   total: <number of found users>,
    //   users: [<User object>, <User object>, ...],
    //   scrollId: "<only if a 'scroll' parameter has been passed in the options>"
    // }
  });

// Using promises (NodeJS)
kuzzle
  .security
  .searchUsersPromise(filters, options)
  .then(result => {
    // result is a JSON Object with the following properties:
    // {
    //   total: <number of found users>,
    //   users: [<User object>, <User object>, ...],
    //   scrollId: "<only if a 'scroll' parameter has been passed in the options>"
    // }
  });

// optional: retrieve only roles allowing access to the
// provided controller names
const filters = {
  controllers:  ['document']
};

// optional result pagination configuration
const options = {
  from: 0,
  size: 10
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .searchRoles(filters, options, function(error, result) {
    // result is a JSON Object with the following properties:
    // {
    //   total: <number of found roles>,
    //   roles: [<Role object>, <Role object>, ...]
    // }
  });

// Using promises (NodeJS)
kuzzle
  .security
  .searchRolesPromise(filters, options)
  .then(result => {
    // result is a JSON Object with the following properties:
    // {
    //   total: <number of found roles>,
    //   roles: [<Role object>, <Role object>, ...]
    // }
  });

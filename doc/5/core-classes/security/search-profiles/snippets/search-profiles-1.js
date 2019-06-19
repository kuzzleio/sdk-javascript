// optional: search only for profiles referring the listed roles
const filters = {
  roles:  ['myrole', 'admin']
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
  .searchProfiles(filters, options, function (error, result) {
    // result is a JSON Object with the following properties:
    // {
    //   total: <number of found profiles>,
    //   profiles: [<Profile object>, <Profile object>, ...],
    //   scrollId: "<only if a 'scroll' parameter has been passed in the options>"
    // }
  });

// Using promises (NodeJS)
kuzzle
  .security
  .searchProfilesPromise(filters, options)
  .then(result => {
    // result is a JSON Object with the following properties:
    // {
    //   total: <number of found profiles>,
    //   profiles: [<Profile object>, <Profile object>, ...],
    //   scrollId: "<only if a 'scroll' parameter has been passed in the options>"
    // }
  });

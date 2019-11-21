try {
  const response = await kuzzle.security.getProfileRights('myProfile');

  console.log(response);
  /*
  [ { controller: 'auth',
      action: 'login',
      index: '*',
      collection: '*',
      value: 'allowed'
    },
    { controller: 'document',
      action: 'get',
      index: 'someIndex',
      collection: '*',
      value: 'allowed'
    } [..]
  ]

  */
} catch (e) {
  console.error(e);
}

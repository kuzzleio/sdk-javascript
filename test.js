const {
  Kuzzle,
  Http
} = require('./index');

// const customRoutes = {
//   'plugin-test/example': {
//     liia: { verb: 'GET', url: '_plugin/plugin-test/example'}
//   }
// }

const kuzzle = new Kuzzle(
  new Http('kuzzle', {  })
);


kuzzle.on('networkError', error => {
  console.error('Network Error:', error);
});

(async () => {
  try {
    await kuzzle.connect();
    await kuzzle.auth.login('local', { username: 'admin', password: 'admin'})
    await kuzzle.security.updateRole('anonymous', {
      "controllers": {
        "auth": {
          "actions": {
            "*": true
          }
        }
      }
    })
    await kuzzle.query({
      controller: 'plugin-test/example',
      action: 'liia'
    })
    // await kuzzle.server.now()
  } catch (error) {
    console.error(error)
  }
})()

const credentials = { username: 'foo', password: 'bar' };

await kuzzle.auth.login('local', credentials);

const response = await kuzzle.auth.createMyCredentials('other', credentials);
console.log(response);
/*
  { username: 'foo', kuid: 'AVkDBl3YsT6qHI7MxLz0' }
*/

console.log('Credentials successfully created');

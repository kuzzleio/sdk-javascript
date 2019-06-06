const credentials = { username: 'foo', password: 'bar' };

await kuzzle.auth.login('local', credentials);

const response = await kuzzle.auth.createMyCredentials('other', credentials);
console.log(response);
/*
  { username: 'foo', password: 'bar' }
*/

console.log('Credentials successfully created');

try {
  await kuzzle.auth.login('local', { username: 'jane.doe', password: 'password' });

  await kuzzle.auth.deleteApiKey('fQRa28BsidO6V_wmOcL');

  console.log('API key successfully deleted');
} catch (e) {
  console.error(e);
}

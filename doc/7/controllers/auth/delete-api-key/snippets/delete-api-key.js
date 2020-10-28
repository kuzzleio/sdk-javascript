try {
  await kuzzle.auth.login('local', { username: 'jane.doe', password: 'password' });

  const apiKey = await kuzzle.auth.createApiKey('Sigfox API key', { refresh: 'wait_for '});

  await kuzzle.auth.deleteApiKey(apiKey._id);

  console.log('API key successfully deleted');
} catch (e) {
  console.error(e);
}

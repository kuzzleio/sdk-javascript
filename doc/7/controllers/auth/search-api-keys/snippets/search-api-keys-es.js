try {
  const promises = [];

  // Create some API keys for user "jared.doe"
  promises.push(
    kuzzle.security.createApiKey('jared.doe', 'Sigfox API key'));
  promises.push(
    kuzzle.security.createApiKey('jared.doe', 'LoRa 6 month API key', {
      expiresIn: '6m'
    }));
  promises.push(
    kuzzle.security.createApiKey('jared.doe', 'LoRa permanent API key', {
      refresh: 'wait_for'
    }));

  await Promise.all(promises);

  // Log as "jared.doe"
  await kuzzle.auth.login('local', { username: 'jared.doe', password: 'password' });

  const results = await kuzzle.auth.searchApiKeys({
    match: {
      description: 'LoRa'
    }
  });

  console.log(results);
  /*
  {
    "total": 2,
    "hits": [
      {
        "_id": "znEwbG8BJASM_0-bWU-q",
        "_source": {
          "description": "LoRa permanent API key",
          "userId": "jared.doe",
          "expiresAt": -1,
          "ttl": -1
        }
      },
      {
        "_id": "zXEwbG8BJASM_0-bWU-q",
        "_source": {
          "description": "LoRa 1 year API key",
          "userId": "jared.doe",
          "expiresAt": 31557600000,
          "ttl": 360000
        }
      }
    ]
  }
  */

  console.log(`Found ${results.total} API keys matching "LoRa"`);
} catch (e) {
  console.error(e);
}

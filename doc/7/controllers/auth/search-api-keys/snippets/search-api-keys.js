try {
  const promises = [];

  // Create some API keys for user "john.doe"
  promises.push(
    kuzzle.security.createApiKey('john.doe', 'Sigfox API key'));
  promises.push(
    kuzzle.security.createApiKey('john.doe', 'LoRa 6 month API key', {
      expiresIn: '6m'
    }));
  promises.push(
    kuzzle.security.createApiKey('john.doe', 'LoRa permanent API key', {
      refresh: 'wait_for'
    }));

  await Promise.all(promises);

  // Log as "john.doe"
  await kuzzle.auth.login('local', { username: 'john.doe', password: 'password' });

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
          "userId": "john.doe",
          "expiresAt": -1,
          "ttl": -1
        }
      },
      {
        "_id": "zXEwbG8BJASM_0-bWU-q",
        "_source": {
          "description": "LoRa 1 year API key",
          "userId": "john.doe",
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

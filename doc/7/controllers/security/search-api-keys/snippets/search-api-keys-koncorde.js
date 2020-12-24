try {
  const promises = [];

  // Create some API keys for user "jared.doe"
  promises.push(
    kuzzle.security.createApiKey('john.doe', 'Sigfox API key'));
  promises.push(
    kuzzle.security.createApiKey('john.doe', 'LoRa 6 month API key', {
      expiresIn: 36000
    }));
  promises.push(
    kuzzle.security.createApiKey('john.doe', 'LoRa permanent API key', {
      expiresIn: 42000, refresh: 'wait_for'
    }));

  await Promise.all(promises);

  const results = await kuzzle.security.searchApiKeys('john.doe', {
    or: [
      {
        equals: {
          ttl: 42000
        }
      },
      {
        equals: {
          ttl: 36000
        },
      }
    ]
  }, { lang: 'koncorde' });

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
          "expiresAt": 31557600000,
          "ttl": 420000
        }
      },
      {
        "_id": "zXEwbG8BJASM_0-bWU-q",
        "_source": {
          "description": "LoRa 1 year API key",
          "userId": "jared.doe",
          "expiresAt": 31557600000,
          "ttl": 420000
        }
      }
    ]
  }
  */

  console.log(`Found ${results.total} API keys.`);
} catch (e) {
  console.error(e);
}

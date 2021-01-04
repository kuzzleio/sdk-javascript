try {
  const promises = [];

  // Create some API keys for user "jared.doe"
  promises.push(
    kuzzle.security.createApiKey('jared.doe', 'Sigfox API key'));
  promises.push(
    kuzzle.security.createApiKey('jared.doe', 'LoRa 6 month API key', {
      expiresIn: 36000
    }));
  promises.push(
    kuzzle.security.createApiKey('jared.doe', 'LoRa permanent API key', {
      expiresIn: 42000, refresh: 'wait_for'
    }));

  await Promise.all(promises);

  // Log as "jared.doe"
  await kuzzle.auth.login('local', { username: 'jared.doe', password: 'password' });

  const results = await kuzzle.auth.searchApiKeys({
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
          "fingerprint": "4ee98cb8c614e99213e7695f822e42325d86c93cfaf39cb40e860939e784c8e6",
          "ttl": 420000
        }
      },
      {
        "_id": "zXEwbG8BJASM_0-bWU-q",
        "_source": {
          "description": "LoRa 1 year API key",
          "userId": "jared.doe",
          "expiresAt": 31557600000,
          "fingerprint": "f822e42325d86c93cfaf39cb40e860939e784c8e64ee98cb8c614e99213e7695",
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

---
code: true
type: page
title: updateCredentials
description: Updates a user credentials for the specified authentication strategy.
---

# updateCredentials

Updates a user credentials for the specified authentication strategy.

<br />

```js
updateCredentials(strategy, kuid, credentials, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `strategy` | <pre>string</pre> | Strategy to use |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
| `credentials` | <pre>object</pre> | New credentials |
| `options` | <pre>object</pre> | Query options |

### credentials

The credentials to send. The expected properties depend on the target authentication strategy.

Example for the `local` strategy:

```js
{
  username: 'foo',
  password: 'bar'
}
```

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the credentials are indexed |

## Resolves

An `object` representing the new credentials.  
The content depends on the authentication strategy.

## Usage

<<< ./snippets/update-credentials.js

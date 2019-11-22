---
code: true
type: page
title: createCredentials
description: Creates authentication credentials for a user
---

# createCredentials

Creates authentication credentials for a user.

<br />

```js
createCredentials(strategy, kuid, credentials, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `strategy` | <pre>string</pre> | Strategy to use |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
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

<<< ./snippets/create-credentials.js

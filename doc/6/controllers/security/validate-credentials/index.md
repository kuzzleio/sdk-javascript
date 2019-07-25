---
code: true
type: page
title: validateCredentials
description: Checks if the provided credentials are well-formed. Does not actually save credentials.
---

# validateCredentials

Checks if the provided credentials are well-formed. Does not actually save credentials.

<br />

```js
validateCredentials(strategy, kuid, credentials, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `strategy` | <pre>string</pre> | Strategy identifier |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication/#kuzzle-user-identifier-kuid) |
| `credentials` | <pre>object</pre> | New credentials |
| `options` | <pre>object</pre> | Query options |

### credentials

The credentials to check. The expected properties depend on the target authentication strategy.

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

## Resolves

A `boolean` telling whether credentials are valid.

## Usage

<<< ./snippets/validate-credentials.js


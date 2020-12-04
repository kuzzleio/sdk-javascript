---
code: true
type: page
title: getCredentials
description: Gets a user's credential information for the specified authentication strategy.
---

# getCredentials

Gets a user's credential information for the specified authentication strategy.

<br />

```js
getCredentials(strategy, kuid, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `strategy` | <pre>string</pre> | Strategy identifier |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An object containing the credential information (depends on the authentication strategy).

## Usage

<<< ./snippets/get-credentials.js

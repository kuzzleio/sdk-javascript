---
code: true
type: page
title: deleteCredentials
description: Deletes user credentials for the specified authentication strategy
---

# deleteCredentials

Deletes user credentials for the specified authentication strategy.

<br />

```js
deleteCredentials(strategy, kuid, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `strategy` | <pre>string</pre> | Strategy to use |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the credentials deletion is indexed |

## Resolves

An acknowledgment message.

## Usage

<<< ./snippets/delete-credentials.js

---
code: true
type: page
title: hasCredentials
description: Checks if a user has credentials registered for the specified authentication strategy.
---

# hasCredentials

Checks if a user has credentials registered for the specified authentication strategy.

<br />

```js
hasCredentials(strategy, kuid, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `strategy` | <pre>string</pre> | Strategy identifier |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication/#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

A boolean telling whether the user can log in using the provided authentication strategy.

## Usage

<<< ./snippets/has-credentials.js


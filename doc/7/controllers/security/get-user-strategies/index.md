---
code: true
type: page
title: getUserStrategies
description: Gets all the available authentication strategies of a user
---

# getUserStrategies

<SinceBadge version="Kuzzle 2.9.0"/>
<SinceBadge version="7.6.0"/>

Gets all the available authentication strategies of a user.

<br />

```js
getUserStrategies(kuid, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves to an array of strings containing all the authentication strategies available for the requested user.

## Usage

<<< ./snippets/get-user-strategies.js

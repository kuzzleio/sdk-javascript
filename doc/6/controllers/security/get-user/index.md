---
code: true
type: page
title: getUser
description: Gets a user
---

# getUser

Gets a user.

<br />

```js
getUser(kuid, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication/#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

The retrieved [`User`](sdk/js/6/core-classes/user/introduction) object.

## Usage

<<< ./snippets/get-user.js


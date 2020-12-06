---
code: true
type: page
title: getUserRights
description: Gets the detailed rights granted to a user
---

# getUserRights

Gets the detailed rights granted to a user.

<br />

```js
getUserRights(kui, [options]);
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

An array of objects. Each object is a security right granted or denied to the user:

- `controller`: impacted controller
- `action`: impacted controller action
- `index`: index name
- `collection`: collection name
- `value`: tell if access if `allowed` or `denied`. If closures have been configured on the detailed scope, the value is `conditional`.


## Usage

<<< ./snippets/get-user-rights.js

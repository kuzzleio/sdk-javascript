---
code: true
type: page
title: getRole
description: Gets a security role
---

# getRole

Gets a security role.

<br />

```js
getRole(id, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `id` | <pre>string</pre> | Role identifier |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

The retrieved [`Role`](/sdk/js/6/core-classes/role) object.

## Usage

<<< ./snippets/get-role.js

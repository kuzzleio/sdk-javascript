---
code: true
type: page
title: updateRole
description: Updates a security role definition
---

# updateRole

Updates a security role definition.

**Note**: partial updates are not supported for roles, this API route will replace the entire role content with the provided one.

<br />

```js
updateRole(id, body, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `id` | <pre>string</pre> | Role identifier |
| `body` | <pre>object</pre> | Role definition content |
| `options` | <pre>object</pre> | Query options |

### body

| Property | Type | Description |
| --- | --- | --- |
| `controllers` | <pre>object</pre> | [Role definition](/core/1/guides/essentials/security#defining-roles) |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the updated role is indexed |

## Resolves

A [`Role`](/sdk/js/6/core-classes/role) object representing the updated role.

## Usage

<<< ./snippets/update-role.js

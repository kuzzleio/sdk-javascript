---
code: true
type: page
title: createRole
description: Creates a new role
---

# createRole

Creates a new role.

<br />

```js
createRole(id, body, [options]);
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
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created role is indexed |

## Resolves

A [`Role`](/sdk/js/6/core-classes/role) object representing the created/replaced role.

## Usage

<<< ./snippets/create-role.js

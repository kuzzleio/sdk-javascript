---
code: true
type: page
title: createOrReplaceRole
description: Creates a new role or, if the provided role identifier already exists, replaces it.
---

# createOrReplaceRole

Creates a new role or, if the provided role identifier already exists, replaces it.

<br />

```js
createOrReplaceRole(id, body, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `id` | <pre>string</pre> | Role identifier |
| `body` | <pre>object</pre> | Role definition content |
| `options` | <pre>object</pre> | Query options |

### body

| Property | Type | Description |
| --- | --- | --- |
| `controllers` | <pre>object</pre> | [Role definition](/core/2/guides/essentials/security#defining-roles) |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created/replaced role is indexed |
| `force`   | <pre>boolean</pre><br />(`false`) | If set to `true`, creates or replaces the role even if it gives access to non-existent plugins API routes. |

## Resolves

A [`Role`](/sdk/js/7/core-classes/role) object representing the created/replaced role.

## Usage

<<< ./snippets/create-or-replace-role.js

---
code: true
type: page
title: deleteRole
description: Deletes a security role
---

# deleteRole

Deletes a security role.

<br />

```js
deleteRole(id, [options]);
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
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the role deletion is indexed |

## Resolves

An acknowledgment message. 

## Usage

<<< ./snippets/delete-role.js

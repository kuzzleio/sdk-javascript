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
| `controllers` | <pre>object</pre> | [Role definition](/core/2/guides/main-concepts/permissions#roles) |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the updated role is indexed |
| `force`   | <pre>boolean</pre><br />(`false`) | If set to `true`, updates the role even if it gives access to non-existent plugins API routes |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`Role`](/sdk/js/7/core-classes/role) object representing the updated role.

## Usage

<<< ./snippets/update-role.js

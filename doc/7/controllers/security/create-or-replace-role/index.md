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
| `controllers` | <pre>object</pre> | [Role definition](/core/2/guides/main-concepts/permissions#roles) |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created/replaced role is indexed |
| `force`   | <pre>boolean</pre><br />(`false`) | If set to `true`, creates or replaces the role even if it gives access to non-existent plugins API routes. |

## Resolves

A [`Role`](/sdk/js/7/core-classes/role) object representing the created/replaced role.

## Usage

<<< ./snippets/create-or-replace-role.js

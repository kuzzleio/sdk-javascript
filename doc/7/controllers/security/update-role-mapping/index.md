---
code: true
type: page
title: updateRoleMapping
description: Updates the internal role storage mapping.
---

# updateRoleMapping

Updates the internal role storage mapping.

<br />

```js
updateRoleMapping(mapping, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `mapping` | <pre>object</pre> | Role collection [mapping definition](/core/2/guides/main-concepts/data-storage) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolves an object representing the new mapping.

## Usage

<<< ./snippets/update-role-mapping.js

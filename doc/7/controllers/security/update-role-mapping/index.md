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
| `mapping` | <pre>object</pre> | Role collection [mapping definition](/core/1/guides/essentials/database-mappings) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An acknowledgment message. 

## Usage

<<< ./snippets/update-role-mapping.js

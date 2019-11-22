---
code: true
type: page
title: updateUserMapping
description: Updates the internal user storage mapping.
---

# updateUserMapping

Updates the internal user storage mapping.

<br />

```js
updateUserMapping(mapping, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `mapping` | <pre>object</pre> | User collection [mapping definition](/core/2/guides/essentials/database-mappings) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves an object representing the new mapping.

## Usage

<<< ./snippets/update-user-mapping.js

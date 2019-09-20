---
code: true
type: page
title: updateProfileMapping
description: Updates the internal profile storage mapping.
---

# updateProfileMapping

Updates the internal profile storage mapping.

<br />

```js
updateProfileMapping(mapping, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `mapping` | <pre>object</pre> | Profile collection [mapping definition](/core/1/guides/essentials/database-mappings) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An acknowledgment message. 

## Usage

<<< ./snippets/update-profile-mapping.js


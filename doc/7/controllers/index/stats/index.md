---
code: true
type: page
title: stats
description: Gets detailed storage statistics
---

# stats

<SinceBadge version="Kuzzle 2.10.0"/>
<SinceBadge version="7.6.0"/>

Gets detailed storage usage statistics.

<br/>

```js
stats([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Returns detailed storage usage statistics: overall index/collection sizes and the number of documents per collection.

## Usage

<<< ./snippets/stats.js

---
code: true
type: page
title: mGet
description: Observer mGet method
---

# mGet

<SinceBadge version="auto-version" />


Gets multiple realtime documents.

## Arguments

```js
mGet (index: string, collection: string, ids: string[]): Promise<{ successes: RealtimeDocument[]; errors: string[]; }>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `ids` | <pre>string[]</pre> | Document IDs |


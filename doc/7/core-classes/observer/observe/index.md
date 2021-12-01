---
code: true
type: page
title: observe
description: Observer observe method
---

# observe

<SinceBadge version="auto-version" />

Retrieve a realtime document from a document

## Arguments

```js
observe (index: string, collection: string, document: Document): Promise<RealtimeDocument>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `document` | <pre>Document</pre> | Document to observe |


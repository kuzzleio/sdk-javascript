---
code: true
type: page
title: stop
description: Observer stop method
---

# stop

<SinceBadge version="auto-version" />

Stop observing documents and release associated ressources.
Can be used either with:
 - a list of documents from a collection: stop observing those documents
 - an index and collection: stop observing all documents in the collection

## Arguments

```js
stop (index?: string, collection?: string, documents?: { _id: string; }[]): Promise<void>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `documents` | <pre>{ _id: string; }[]</pre> | Array of documents |


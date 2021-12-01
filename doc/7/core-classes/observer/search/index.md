---
code: true
type: page
title: search
description: Observer search method
---

# search

<SinceBadge version="auto-version" />

Searches for documents and returns a SearchResult containing realtime
documents.

## Arguments

```js
search (index: string, collection: string, searchBody: JSONObject, options: { from?: number; size?: number; scroll?: string; lang?: string; verb?: string; timeout?: number; }): Promise<RealtimeDocumentSearchResult>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `searchBody` | <pre>JSONObject</pre> | Search query |
| `options` | <pre>{ from?: number; size?: number; scroll?: string; lang?: string; verb?: string; timeout?: number; }</pre> | Additional options
- `queuable` If true, queues the request during downtime, until connected to Kuzzle again
- `from` Offset of the first document to fetch
- `size` Maximum number of documents to retrieve per page
- `scroll` When set, gets a forward-only cursor having its ttl set to the given value (e.g. `30s`)
- `verb` (HTTP only) Forces the verb of the route
- `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected |


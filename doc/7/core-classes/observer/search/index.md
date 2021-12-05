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

::: info
This method uses the [Document.search](/sdk/js/7/controllers/document/search) method under the hood to retrieve documents.
:::

## Arguments

```js
search (index: string, collection: string, searchBody: JSONObject, options: JSONObject): Promise<RealtimeDocumentSearchResult>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `searchBody` | <pre>JSONObject</pre> | Search body |
| `options` | <pre>JSONObject</pre> | Additional options |

## Usage

```js
const observer = new Observer(sdk);

let result = await observer.search('nyc-open-data', 'yellow-taxi', {
  query: { exists: 'licence' }
});

console.log(result);
/*
  RealtimeDocumentSearchResult {
    aggregations: undefined,
    hits: [
      RealtimeDocument {
        _id: 'some-id',
        _source: [Object],
        deleted: false
      },
      RealtimeDocument {
        _id: 'XaMyen0BDorKTmOQPm2u',
        _source: [Object],
        deleted: false
      }
    ],
    fetched: 2,
    total: 2,
    suggest: undefined
  }
*/
```
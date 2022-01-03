---
code: true
type: page
title: observe
description: Observer observe method
---

# observe

<SinceBadge version="7.8.0" />

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

## Usage

```js
const observer = new Observer(sdk);

const doc = await sdk.document.get('nyc-open-data', 'yellow-taxi', 'some-id');

const realtimeDoc = await observer.observe('nyc-open-data', 'yellow-taxi', doc);

console.log(realtimeDoc);
/*
  RealtimeDocument {
    _id: 'some-id',
    _source: {
      name: 'aschen',
      age: '29',
      _kuzzle_info: {
        author: '-1',
        createdAt: 1638432270522,
        updatedAt: null,
        updater: null
      }
    },
    deleted: false
  }
*/
```
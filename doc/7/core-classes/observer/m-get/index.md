---
code: true
type: page
title: mGet
description: Observer mGet method
---

# mGet

<SinceBadge version="auto-version" />


Gets multiple realtime documents.

::: info
This method use the [Document.mGet](/sdk/js/7/controllers/document/m-get) method under the hood to retrieve documents.
:::

## Arguments

```js
mGet (index: string, collection: string, ids: string[]): Promise<{ successes: RealtimeDocument[]; errors: string[]; }>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `ids` | <pre>string[]</pre> | Document IDs |

## Usage

```js
const observer = new Observer(sdk);

const docs = await observer.get('nyc-open-data', 'yellow-taxi', ['foo', 'bar']);

console.log(docs);
/*
  [
    RealtimeDocument {
      _id: 'foo',
      _source: {
        name: 'aschen',
        age: '28',
        _kuzzle_info: {
          author: '-1',
          createdAt: 1638432270522,
          updatedAt: null,
          updater: null
        }
      },
      deleted: false
    },
    RealtimeDocument {
      _id: 'bar',
      _source: {
        name: 'dana',
        age: '30',
        _kuzzle_info: {
          author: '-1',
          createdAt: 1638432270522,
          updatedAt: null,
          updater: null
        }
      },
      deleted: false
    }
  ]
*/
```
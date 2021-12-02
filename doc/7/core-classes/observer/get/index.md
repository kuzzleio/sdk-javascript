---
code: true
type: page
title: get
description: Observer get method
---

# get

<SinceBadge version="auto-version" />

Gets a realtime document

::: info
This method use the [Document.get](/sdk/js/7/controllers/document/get) method under the hood to retrieve document.
:::

## Arguments

```js
get (index: string, collection: string, id: string, options: any): Promise<RealtimeDocument>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `id` | <pre>string</pre> | Document ID |
| `options` | <pre>any</pre> | Additional options |

## Usage

```js
const observer = new Observer(sdk);

const doc = await observer.get('nyc-open-data', 'yellow-taxi', 'some-id');

console.log(doc);
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

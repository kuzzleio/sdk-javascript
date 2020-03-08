---
code: false
type: page
title: Properties
description: Observer class properties
order: 10
---

# Properties

Available properties:

| Property      | Type               | Description                                         |
|---------------|--------------------|-----------------------------------------------------|
| `_id`         | <pre>string</pre>  | Document ID                                         |
| `_source`     | <pre>object</pre>  | Document content                                    |
| `_index`      | <pre>string</pre>  | Index name                                          |
| `_collection` | <pre>string</pre>  | Collection name                                     |
| `_listening`  | <pre>boolean</pre> | `true` is the observer is listening for changes     |
| `notifyOnly`  | <pre>boolean</pre> | If `true`, the observer will not update its content |

```js
Observer {
  _listening: true,
  _index: <index>,
  _collection: <collection>,
  _id: <document-id>,
  _source: {
    // document content
  }
}
```

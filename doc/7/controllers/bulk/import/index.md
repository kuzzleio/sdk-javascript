---
code: true
type: page
title: import
description: Performs a bulk import on a collection
---

# Import

Create, update or delete large amount of documents as fast as possible.

This route is faster than the `document:m*` routes family (e.g. [document:mCreate](/sdk/js/7/controllers/document/m-create)), but no real-time notifications will be generated, even if some of the documents in the import match subscription filters.

<br/>

```js
import (index, collection, bulkData, [options])
```

<br/>

| Arguments  | Type                | Description                                     |
| ---------- | ------------------- | ----------------------------------------------- |
| `index`      | <pre>string</pre> | Index name           |
| `collection` | <pre>string</pre> | Collection name      |
| `bulkData` | <pre>object[]</pre> | List of documents to be added to the collection |
| `options`  | <pre>object</pre>   | Query options                                   |

### bulkData

This API takes a JSON array containing a list of objects working in pairs.
In each pair, the first object specifies the action to perform (the most common is `create`) and the second specifies the document itself, like in the example below:

```js
[
  // Action object
  { create: { _id: 'id' } },
  // Document object
  { myField: 'myValue', myOtherField: 'myOtherValue' },

  // Another action object
  { create: { _id: 'another-id' } },
  // Another document object
  { myField: 'anotherValue', myOtherField: 'yetAnotherValue' }
];
```

::: warning
You cannot specify either the `_index` or the `_type` options with a bulk import.  
You have to specify the index/collection in the request.
:::

Possible actions are `create`, `index`, `update`, `delete`.

Learn more at [Elasticsearch Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/docs-bulk.html)

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

---

## Resolves

Resolves to an object containing 2 properties:

| Property | Type                | Description                                         |
| -------- | ------------------- | --------------------------------------------------- |
| `successes`  | <pre>object[]</pre> | Array of object containing successful document import |
| `errors` | <pre>object[]</pre>  | Array of object containing failed document import     |

Each item of the `successes` array is an object containing the action name as key and the corresponding object contain the following properties:

| Property | Type                | Description                                         |
| -------- | ------------------- | --------------------------------------------------- |
| `_id`   | <pre>String</pre>   | Document unique identifier      |
| `status`   | <pre>String</pre>   | HTTP status code for that query      |

Each item of the `successes` array is an object containing the action name as key and the corresponding object contain the following properties:

| Property | Type                | Description                                         |
| -------- | ------------------- | --------------------------------------------------- |
| `_id`   | <pre>String</pre>   | Document unique identifier      |
| `status`   | <pre>String</pre>   | HTTP status code for that query      |
| `error`   | <pre>Object</pre>   | Error object      |

Each error object contain the following properties:

| Property | Type                | Description                                         |
| -------- | ------------------- | --------------------------------------------------- |
| `type`  | <pre>String</pre> | Elasticsearch client error type |
| `reason`  | <pre>String</pre> | human readable error message |


## Usage

<<< ./snippets/import.js

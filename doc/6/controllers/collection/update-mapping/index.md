---
code: true
type: page
title: updateMapping
description: Update the collection mapping
---

# updateMapping

Updates a data collection mapping.

<br/>

```javascript
updateMapping(index, collection, mapping, [options]);
```

<br/>

| Arguments    | Type              | Description                                                                                                                                                                   |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`      | <pre>string</pre> | Index name                                                                                                                                                                    |
| `collection` | <pre>string</pre> | Collection name                                                                                                                                                               |
| `mapping`    | <pre>object</pre> | Describes the data mapping to associate to the new collection, using Elasticsearch [mapping format](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/mapping.html) |
| `options`    | <pre>object</pre> | Query options                                                                                                                                                                 |

### mapping

An object representing the collection data mapping.

This object must have a root field `properties` that contain the mapping definition:

```javascript
const mapping = {
  properties: {
    field1: { type: 'text' },
    field2: {
      properties: {
        nestedField: { type: 'keyword' }
      }
    }
  }
};
```

You can see the full list of Elasticsearch mapping types [here](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/mapping-types.html).

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolve if the collection is successfully updated.

## Usage

<<< ./snippets/update-mapping.js

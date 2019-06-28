---
code: true
type: page
title: create
description: Create a new collection
---

# create

Creates a new [collection](/core/1/guides/essentials/persisted/) in Kuzzle via the persistence engine, in the provided index.

You can also provide an optional data mapping that allow you to exploit the full capabilities of our
persistent data storage layer, [ElasticSearch](https://www.elastic.co/products/elasticsearch) (check here the [mapping capabilities of ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/mapping.html)).

This method will only update the mapping if the collection already exists.

<br/>

```js
create(index, collection, [mapping], [options]);
```

<br/>

| Arguments    | Type              | Description                                                                                                                                                                   |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`      | <pre>string</pre> | Index name                                                                                                                                                                    |
| `collection` | <pre>string</pre> | Collection name                                                                                                                                                               |
| `mapping`    | <pre>object</pre> | Describes the data mapping to associate to the new collection, using Elasticsearch [mapping format](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/mapping.html) |
| `options`    | <pre>object</pre> | Query options                                                                                                                                                                 |

### mapping

An object representing the data mapping of the collection.

The mapping must have a root field `properties` that contain the mapping definition:

```js
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

More informations about database mappings [here](/core/1/guides/essentials/database-mappings).

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves if the collection is successfully created.

## Usage

<<< ./snippets/create.js

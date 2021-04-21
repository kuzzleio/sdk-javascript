---
code: true
type: page
title: create
description: Create a new collection
---

# create

Creates a new [collection](/core/2/guides/main-concepts/data-storage) in the provided index.

You can also provide an optional data mapping that allow you to exploit the full capabilities of our
persistent data storage layer, [ElasticSearch](https://www.elastic.co/elastic-stack) (check here the [mapping capabilities of ElasticSearch](/core/2/guides/main-concepts/data-storage)).

This method will only update the mapping if the collection already exists.

<SinceBadge version="Kuzzle 2.2.0" />
<SinceBadge version="7.4.0" />

You can also provide Elasticsearch [index settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.5/index-modules.html#index-modules-settings) when creating a new collection.

<br/>

```js
create(index, collection, [definition], [options]);
```

<br/>

| Arguments    | Type              | Description                                                 |
| ------------ | ----------------- | ----------------------------------------------------------- |
| `index`      | <pre>string</pre> | Index name                                                  |
| `collection` | <pre>string</pre> | Collection name                                             |
| `definition` | <pre>object</pre> | Describes the collection mappings and the ES index settings |
| `options`    | <pre>object</pre> | Query options                                               |
<SinceBadge version="7.4.0">

### definition

An object containings:
 - [collection mappings](/core/2/guides/main-concepts/data-storage).
 - Elasticsearch [index settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.5/index-modules.html#index-modules-settings)
The mapping must have a root field `properties` that contain the mapping definition:

```js
const definition = {
  mappings: {
    properties: {
      field1: { type: 'text' },
      field2: {
        properties: {
          nestedField: { type: 'keyword' }
        }
      }
    }    
  },
  settings: {

  }
};
```

</SinceBadge>


<DeprecatedBadge version="7.4.0">

### definition

An object representing the data mappings of the collection.

The mappings must have a root field `properties` that contain the mappings properties definition:

```js
const mappings = {
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

More informations about database mappings [here](/core/2/guides/main-concepts/data-storage).

</DeprecatedBadge>

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `timeout`  | <pre>number</pre><br/>(`-1`)    | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves if the collection is successfully created.

## Usage

<<< ./snippets/create.js

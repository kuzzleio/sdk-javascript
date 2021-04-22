---
code: true
type: page
title: update
description: Update the collection mapping
---

# update

<SinceBadge version="Kuzzle 2.1.0" />

You can define the collection [dynamic mapping policy](/core/2/guides/main-concepts/data-storage#mappings-dynamic-policy) by setting the `dynamic` field to the desired value.

You can define [collection additional metadata](/core/2/guides/main-concepts/data-storage#mappings-metadata) within the `_meta` root field.

<SinceBadge version="Kuzzle 2.2.0" />
<SinceBadge version="7.4.0" />

You can also provide Elasticsearch [index settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.5/index-modules.html#index-modules-settings) when creating a new collection.

<br/>

```js
update(index, collection, definition);
```

<br/>

| Arguments    | Type              | Description                                                 |
|--------------|-------------------|-------------------------------------------------------------|
| `index`      | <pre>string</pre> | Index name                                                  |
| `collection` | <pre>string</pre> | Collection name                                             |
| `definition` | <pre>object</pre> | Describes the collection mappings and the ES index settings |
| `options`    | <pre>object</pre> | Query options                                               |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                    |
| `timeout`  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |


<SinceBadge version="7.4.0">

### definition

An object containing:
 - [collection mappings](/core/2/guides/main-concepts/data-storage).
 - Elasticsearch [index settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.5/index-modules.html#index-modules-settings)


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
    // index settings (e.g. analyzers)
  }
};
```
</SinceBadge>

<DeprecatedBadge version="7.4.0" >

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

## Resolves

Resolve if the collection is successfully updated.

## Usage

<<< ./snippets/update.js

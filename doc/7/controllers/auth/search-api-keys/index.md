---
code: true
type: page
title: searchApiKeys
description: Searches API keys for the currently loggued user.
---

# searchApiKeys

<SinceBadge version="7.1.0" />

<SinceBadge version="Kuzzle 2.1.0" />

Searches API keys for the currently loggued user.

<br />

```js
searchApiKeys([query], [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `query` | <pre>object</pre> | Search query |
| `options` | <pre>object</pre> | Additional options |

### query

The search query to apply to API keys content, using [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/query-dsl.html) syntax.

<SinceBadge version="auto-version"/>

This method also supports the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) to match documents by passing the `lang` argument with the value `koncorde`.  
Koncorde filters will be translated into an Elasticsearch query.  

::: warning
Koncorde `bool` operator and `regexp` clause are not supported for search queries.
:::

If left empty, the result will return all available API keys of the currently loggued user.

### options

Additional query options

| Property   | Type<br/>(default)   | Description  |
| ---------- | ------------------ | ------------ |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch   |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page     |
| `lang`     | <pre>string</pre>               | Specify the query language to use. By default, it's `elasticsearch` but `koncorde` can also be used. <SinceBadge version="auto-version"/> |

## Resolves

Resolves an object with the following properties:

| Name      | Type              | Description      |
| --------- | ----------------- | ---------------- |
| `hits`      | <pre>object[]</pre> | Array of objects representing found API keys |
| `total`  | <pre>number</pre> | Total number of API keys found. Depending on pagination options, this can be greater than the actual number of API keys in a single result page |

Each object of the `hits` array has the following properties:

| Name      | Type              | Description      |
| --------- | ----------------- | ---------------- |
| `_id_`      | <pre>string</pre> | API key unique ID |
| `_source`  | <pre>object</pre> | API key definition without the `token` field |


## Usage

With the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/query-dsl.html) syntax.

<<< ./snippets/search-api-keys-es.js

With the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) syntax.

<<< ./snippets/search-api-keys-koncorde.js
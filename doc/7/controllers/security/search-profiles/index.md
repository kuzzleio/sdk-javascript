---
code: true
type: page
title: searchProfiles
description: Searches security profiles, optionally returning only those linked to the provided list of security roles
---

# searchProfiles

Searches security profiles.

<SinceBadge version="7.8.3" />
<SinceBadge version="Kuzzle 2.14.1" />

Support for search using a search query with the `query` property.

This method also supports the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) to match documents by passing the `lang` argument with the value `koncorde`.  
Koncorde filters will be translated into an Elasticsearch query.  

<br />

```js
searchProfiles([body], [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `body` | <pre>object</pre> | Search query |
| `options` | <pre>object</pre> | Query options |

### body
| Property | Type | Description |
| --- | --- | --- |
| `roles` | <pre>array&lt;string&gt;</pre> | Role identifiers <DeprecatedBadge version="7.8.3"/>|
| `query` | <pre>object</pre> | Search query using the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) or the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) syntax. <SinceBadge version="7.8.3"/>|

If the body is left empty, the result will return all available profiles.

### options

| Property   | Type<br/>(default)              | Description                                                                                                                                                                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                                                                                                                      |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch                                                                                                                                                                             |
| `lang`     | <pre>string</pre>               | Specify the query language to use. By default, it's `elasticsearch` but `koncorde` can also be used. |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page                                                                                                                                                                  |
| `scroll`   | <pre>string</pre><br/>(`""`)    | When set, gets a forward-only cursor having its ttl set to the given value (ie `30s`; cf [elasticsearch time limits](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/common-options.html#time-units)) |

## Resolves

A [`SearchResult`](sdk/js/7/core-classes/search-result) object containing the retrieved [`Profile`](/sdk/js/7/core-classes/profile) objects.

## Usage

<<< ./snippets/search-profiles.js

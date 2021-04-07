---
code: false
type: page
title: Properties
description: SearchResult class properties
order: 100
---

# Properties

| Property | Type | Description |
|--- |--- |--- |
| `aggregations` | <pre>object</pre> | Search aggregations (can be undefined) |
| `fetched` | <pre>number</pre> | Number of retrieved items so far |
| `hits` | <pre>object[]</pre> | Page results |
| `suggest` | <pre>number</pre> |  [Suggesters](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/search-suggesters.html) results <SinceBadge version="7.6.0"/> |
| `total` | <pre>number</pre> |  Total number of items that _can_ be retrieved |

### hits

Each object of the `hits` array contain the following properties:

| Property | Type | Description |
|--- |--- |--- |
| `_id` | <pre>string</pre> | Document ID |
| `_score` | <pre>number</pre> | [Relevance score](https://www.elastic.co/guide/en/elasticsearch/guide/current/relevance-intro.html) |
| `_source` | <pre>object</pre> | Document content |

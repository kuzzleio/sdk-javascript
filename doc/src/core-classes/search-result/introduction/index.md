---
code: true
type: page
title: Introduction
description: SearchResult class
order: 0
---

# SearchResult

The class is used to retrieve the subsequent paginated results of a search query.  
The following methods returns a `SearchResult`:

- [document:search](/sdk/js/6/controllers/document/search)
- [collection:searchSpecifications](/sdk/js/6/collection/search-specifications)

## Properties

Available properties.

| Property       | Type                | Description                                                       |
| -------------- | ------------------- | ----------------------------------------------------------------- |
| `aggregations` | <pre>object</pre>   | Search aggregations if any                                        |
| `hits`         | <pre>object[]</pre> | Array containing the retrieved items for the current page         |
| `total`        | <pre>number</pre>   | Total number of items matching the given query in Kuzzle database |
| `fetched`      | <pre>number</pre>   | Number of retrieved items so far                                  |
| `scroll_id`    | <pre>string</pre>   | Scroll identifier if the search was given a `scroll` parameter    |

Each object of the `hits` array contain the following properties:

| Property  | Type              | Description                                                                                         |
| --------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| `_id`     | <pre>string</pre> | Document ID                                                                                         |
| `_score`  | <pre>number</pre> | [Relevance score](https://www.elastic.co/guide/en/elasticsearch/guide/current/relevance-intro.html) |
| `_source` | <pre>object</pre> | Document content                                                                                    |

---
code: true
type: page
title: searchProfiles
description: Searches security profiles, optionally returning only those linked to the provided list of security roles
---

# searchProfiles

Searches security profiles, optionally returning only those linked to the provided list of security roles.

<br />

```js
searchProfiles([body], [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `body` | <pre>object</pre> | Query including role identifiers to search for |
| `options` | <pre>object</pre> | Query options |

### body

| Property | Type | Description |
| --- | --- | --- |
| `roles` | <pre>array&lt;string&gt;</pre> | Role identifiers |

### options

| Property   | Type<br/>(default)              | Description                                                                                                                                                                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                                                                                                                      |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch                                                                                                                                                                             |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page                                                                                                                                                                  |
| `scroll`   | <pre>string</pre><br/>(`""`)    | When set, gets a forward-only cursor having its ttl set to the given value (ie `30s`; cf [elasticsearch time limits](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/common-options.html#time-units)) |

## Resolves

A [`SearchResult`](sdk/js/6/core-classes/search-result) object containing the retrieved [`Profile`](/sdk/js/6/core-classes/profile) objects.

## Usage

<<< ./snippets/search-profiles.js

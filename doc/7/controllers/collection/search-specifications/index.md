---
code: true
type: page
title: searchSpecifications
description: Search for specifications
---

# searchSpecifications



Searches collection specifications.

There is a limit to how many items can be returned by a single search query.
That limit is by default set at 10000, and you can't get over it even with the from and size pagination options.

:::info
When processing a large number of items (i.e. more than 1000), it is advised to paginate the results using [SearchResult.next](/sdk/js/7/core-classes/search-result/next) rather than increasing the size parameter.
:::

<br/>

```js
searchSpecifications([body], [options]);
```

<br/>

| Arguments | Type              | Description                           |
| --------- | ----------------- | ------------------------------------- |
| `body`    | <pre>object</pre> | An object containing the search query |
| `options` | <pre>object</pre> | Query options                         |

### body

The body is a set of filters using [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/search-request-body.html) to match the documents you are looking for.
The filters must be inside the `query` property of the body.

Example:

```js
const body = {
  query: {
    match_all: {
      boost: 1
    }
  }
};
```

### options

| Arguments  | Type                            | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document                                                                                          |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents returned                                                                                  |
| `scroll`   | <pre>string</pre><br/>          | Maximum duration for scroll session                                                                                   |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

- `size` controls the maximum number of documents returned in the response
- `from` is usually used with the `size` argument, and defines the offset from the first result you want to fetch
- `scroll` is used to fetch large result sets, and it must be set with a [time duration](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/common-options.html#time-units). If set, a forward-only cursor will be created (and automatically destroyed at the end of the set duration), and its identifier will be returned in the `scrollId` property, along with the first page of the results.
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolve to a [SpecificationsSearchResult](/sdk/js/7/core-classes/search-result).

## Usage

<<< ./snippets/search-specifications.js

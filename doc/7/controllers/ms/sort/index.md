---
code: true
type: page
title: sort
---

# sort

Sorts and returns elements contained in a list, a set of unique values or a sorted set.  
By default, sorting is numeric and elements are compared by their value, interpreted as double precision floating point number.

[[_Redis documentation_]](https://redis.io/commands/sort)

## Arguments

```js
sort(key, [options]);
```

<br/>

| Arguments | Type              | Description                 |
| --------- | ----------------- | --------------------------- |
| `key`     | <pre>string</pre> | List, set or sorted set key |
| `options` | <pre>object</pre> | Optional query arguments    |

### options

The `options` arguments can contain the following option properties:

| Property    | Type (default)             | Description                                                                                                                                                 |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alpha`     | <pre>boolean (false)</pre> | Performs an alphanumerical sort instead of a numeric one                                                                                                    |
| `by`        | <pre>string</pre>          | Instead of sorting by values, sorts by values contained in external keys, using the provided pattern completed by values of the list/set/sorted set to sort |
| `direction` | <pre>string ('ASC')</pre>  | Sorts in ascendant or descendant order.<br/>Allowed values: `ASC`, `DESC`                                                                                   |
| `get`       | <pre>string[]</pre>        | Instead of returning the sorted values directly, returns the values contained in external keys, using patterns completed by the sorted values               |
| `limit`     | <pre>integer[]</pre>       | Limits the result set to a range of matching elements (similar to _SELECT LIMIT offset, count_ in SQL).<br/>Format: `[<offset(int)>, <count(int)>]`         |
| `queuable`  | <pre>boolean (true)</pre>  | If `true`, queues the request during downtime, until connected to Kuzzle again                                                                                |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the sorted elements.

## Usage

<<< ./snippets/sort.js

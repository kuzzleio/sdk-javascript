---
code: true
type: page
title: zadd
---

# zadd

Adds elements to a sorted set.

If the key does not exist, it is created, holding an empty sorted set.

If the key already exists but does not hold a sorted set, an error is returned.

If a member to insert is already in the sorted set, its score is updated and the member is reinserted at the right position in the set.

[[_Redis documentation_]](https://redis.io/commands/zadd)

## Arguments

```js
zadd(key, elements, [options]);
```

<br/>

| Arguments  | Type                | Description              |
| ---------- | ------------------- | ------------------------ |
| `key`      | <pre>string</pre>   | Sorted set key           |
| `elements` | <pre>object[]</pre> | Elements to add          |
| `options`  | <pre>object</pre>   | Optional query arguments |

### elements

The `elements` array lists the elements to add to the sorted set. Each element object has the following properties:

| Properties | Type              | Description  |
| ---------- | ----------------- | ------------ |
| `member`   | <pre>string</pre> | Member value |
| `score`    | <pre>string</pre> | Member score |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)             | Description                                                                                                                                            |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ch`       | <pre>boolean (false)</pre> | If `true`, instead of returning the number of added elements, returns the number of changes performed                                                    |
| `incr`     | <pre>boolean (false)</pre> | If `true`, instead of adding elements, increments the existing member with the provided `score`. Only one element can be specified if this option is set |
| `nx`       | <pre>boolean (false)</pre> | If `true`, only adds new elements, without altering existing ones                                                                                        |
| `queuable` | <pre>boolean (true)</pre>  | If `true`, queues the request during downtime, until connected to Kuzzle again                                                                           |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
| `xx`       | <pre>boolean (false)</pre> | If `true`, ignores new elements, alters only existing ones                                                                                               |

## Resolve

Resolves to the number of added elements or, if the `ch` option is set, resolves to the number of changes performed.

## Usage

<<< ./snippets/zadd.js

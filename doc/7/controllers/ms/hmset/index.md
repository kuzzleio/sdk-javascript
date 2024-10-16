---
code: true
type: page
title: hmset
---

# hmset

Sets multiple fields at once in a hash.

[[_Redis documentation_]](https://redis.io/commands/hmset)

## Arguments

```js
hmset(key, entries, [options]);
```

<br/>

| Arguments | Type                | Description                      |
| --------- | ------------------- | -------------------------------- |
| `key`     | <pre>string</pre>   | Hash key                         |
| `entries` | <pre>object[]</pre> | List of field-value pairs to set |
| `options` | <pre>object</pre>   | Optional query arguments         |

### entries

The `entries` array lists the fields to set in the hash. Each entry object has the following properties:

| Properties | Type              | Description |
| ---------- | ----------------- | ----------- |
| `field`    | <pre>string</pre> | Field name  |
| `value`    | <pre>string</pre> | Field value |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`triggerEvents`](/sdk/7/core-classe| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |s/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves once the fields have been set.

## Usage

<<< ./snippets/hmset.js

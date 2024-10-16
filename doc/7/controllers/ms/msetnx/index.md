---
code: true
type: page
title: msetnx
---

# msetnx

Sets the provided keys to their respective values, only if they do not exist. If a key exists, then the whole operation is aborted and no key is set.

[[_Redis documentation_]](https://redis.io/commands/msetnx)

## Arguments

```js
msetnx(entries, [options]);
```

<br/>

| Arguments | Type                | Description                    |
| --------- | ------------------- | ------------------------------ |
| `entries` | <pre>object[]</pre> | List of key-value pairs to set |
| `options` | <pre>object</pre>   | Optional query arguments       |

### entries

The `entries` argument is an array of objects. Each object is a key-value pair, defined with the following properties:

| Property | Type              | Description |
| -------- | ----------------- | ----------- |
| `key`    | <pre>string</pre> | Key         |
| `value`  | <pre>\*</pre>     | Value       |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to a boolean telling whether the keys have been set or not.

## Usage

<<< ./snippets/msetnx.js

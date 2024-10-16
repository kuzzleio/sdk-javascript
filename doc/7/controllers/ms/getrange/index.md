---
code: true
type: page
title: getrange
---

# getrange

Returns a substring of a key's value.

[[_Redis documentation_]](https://redis.io/commands/getrange)

## Arguments

```js
getrange(key, start, end, [options]);
```

<br/>

| Arguments | Type               | Description              |
| --------- | ------------------ | ------------------------ |
| `key`     | <pre>string</pre>  | Key                      |
| `start`   | <pre>integer</pre> | Range start              |
| `end`     | <pre>integer</pre> | Range end                |
| `options` | <pre>object</pre>  | Optional query arguments |

The arguments `start` and `end` can be negative. In that case, the offset is calculated from the end of the string, going backward. For instance, -3 is the third character from the end of the string.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
## Resolve

Resolves to the extracted substring.

## Usage

<<< ./snippets/getrange.js

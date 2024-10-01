---
code: true
type: page
title: renamenx
---

# renamenx

Renames a key, only if the new name is not already used.

[[_Redis documentation_]](https://redis.io/commands/renamenx)

## Arguments

```js
renamenx(src, dest, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `src`     | <pre>string</pre> | Key to rename            |
| `dest`    | <pre>string</pre> | New key name             |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to a boolean telling whether the operation succeeded or not.

## Usage

<<< ./snippets/renamenx.js

---
code: true
type: page
title: object
---

# object

Inspects the low-level properties of a key.

[[_Redis documentation_]](https://redis.io/commands/object)

## Arguments

```js
object(key, subcommand, [options]);
```

<br/>

| Arguments    | Type              | Description                                                                        |
| ------------ | ----------------- | ---------------------------------------------------------------------------------- |
| `key`        | <pre>string</pre> | Key                                                                                |
| `subcommand` | <pre>string</pre> | Object property to inspect.<br/>Allowed values: `encoding`, `idletime`, `refcount` |
| `options`    | <pre>object</pre> | Optional query arguments                                                           |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the inspected property value.

## Usage

<<< ./snippets/object.js

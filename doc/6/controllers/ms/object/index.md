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
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the inspected property value.

## Usage

<<< ./snippets/object.js

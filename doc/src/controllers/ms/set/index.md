---
code: true
type: page
title: set
---

# set

Creates a key holding the provided value, or overwrites it if it already exists.

[[_Redis documentation_]](https://redis.io/commands/set)

## Arguments

```js
set(key, value, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Key                      |
| `value`   | <pre>\*</pre>     | Value                    |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)             | Description                                                                  |
| ---------- | -------------------------- | ---------------------------------------------------------------------------- |
| `ex`       | <pre>integer</pre>         | Adds an expiration delay to the key, in seconds                              |
| `nx`       | <pre>boolean (false)</pre> | If true, do not set the key if it already exists                             |
| `px`       | <pre>integer</pre>         | Adds an expiration delay to the key, in milliseconds                         |
| `queuable` | <pre>boolean (true)</pre>  | If true, queues the request during downtime, until connected to Kuzzle again |
| `xx`       | <pre>boolean (false)</pre> | If true, sets the key only if it already exists                              |

Note: the `ex` and `px` options are mutually exclusive; setting both options ends up in a `BadRequestError` error. Same thing goes for `nx` and `xx`.

## Resolve

Resolves once the operation succeeds.

## Usage

<<< ./snippets/set.js

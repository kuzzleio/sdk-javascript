---
code: true
type: page
title: zscan
---

# zscan

Iterates incrementally over members contained in a sorted set, using a cursor.

An iteration starts when the cursor is set to 0.  
To get the next page of results, simply re-send the request with the updated cursor position provided in the result set.

The scan ends when the cursor returned by the server is 0.

[[_Redis documentation_]](https://redis.io/commands/sscan)

## Arguments

```js
zscan(key, cursor, [options]);
```

<br/>

| Arguments | Type               | Description              |
| --------- | ------------------ | ------------------------ |
| `key`     | <pre>string</pre>  | Sorted set key           |
| `cursor`  | <pre>integer</pre> | Cursor offset            |
| `options` | <pre>object</pre>  | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `count`    | <pre>integer (10)</pre>   | Return an _approximate_ number of items per result set                       |
| `match`    | <pre>string (\*)</pre>    | Return only keys matching the provided pattern                               |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an object representing a result page, with the following properties:

| Property | Type                | Description                                                                                               |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| `cursor` | <pre>integer</pre>  | Cursor offset for the next page, or `0` if at the end of the scan                                         |
| `values` | <pre>string[]</pre> | List of member-score pairs. The array entries alternate between member values and their associated scores |

## Usage

<<< ./snippets/zscan.js

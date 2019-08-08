---
code: false
type: page
title: Properties
description: Http class properties
order: 10
---


# Properties

| Property name        | Type     | Description          |  Get/Set |
| -------------------- | -------- | ---------------------| ---------|
| `connected`  | <pre>boolean</pre>  | Always returns `true` | Get |
| `host`  | <pre>string</pre>  | Kuzzle server host | Get |
| `http`  | <pre>object</pre>  | Returns a list of available routes <DeprecatedBadge version="6.2.0"/> | Get |
| `routes`  | <pre>object</pre>  | Returns a list of available routes <SinceBadge version="6.2.0"/> | Get |
| `port`  | <pre>number</pre>  | Kuzzle server port | Get |
| `protocol`  | <pre>string</pre>  | `https` or `http` | Get |
| `ssl`  | <pre>boolean</pre>  | `true` if ssl is active | Get |
| `timeout`  | <pre>number</pre>  | Connection timeout in milliseconds <SinceBadge version="6.2.1"/>| Get/Set |

**Note:**

A `timeout` of 0 mean that the connection will never timeout.
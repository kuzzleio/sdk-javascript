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
| `connectTimeout`  | <pre>number</pre>  | Connection timeout in milliseconds <SinceBadge version="7.0.2"/>| Get/Set |
| `requestTimeout`  | <pre>number</pre>  | Request timeout in milliseconds <SinceBadge version="7.0.2"/>| Get/Set |
| `timeout`  | <pre>number</pre>  | Connection timeout in milliseconds <DeprecateBadge version="7.0.2"/>| Get/Set |

**Note:**

A `connectTimeout` or `requestTimeout` of 0 means that the connection will never timeout.

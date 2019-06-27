---
code: true
type: page
title: query
description: Wrapper around the Kuzzle.query method
---

# query

Base method used to send queries to a Kuzzle controller, following the [API Documentation](/core/1/api/essentials/connecting-to-kuzzle).  

This method injects the controller name into the the request and forwards it to the original [Kuzzle.query](/sdk/js/6/core-classes/kuzzle/query) method.

## Arguments

```js
query (request, [options]);
```

<br/>

| Argument  | Type   | Description            |
| -------------- | --------- | ------------- |
| `request` | <pre>object</pre> | API request  |
| `options` | <pre>object</pre> | Optional query options |

### request

All properties necessary for the Kuzzle API can be added in the request object.
The following properties are the most common.

| Property     | Type   | Description                               |
| -------------- | --------- | ------------- |
| `action`     | <pre>string</pre> | Action name (required)                   |
| `controller` | <pre>string</pre> | Controller name                           |
| `body`       | <pre>object</pre> | Query body for this action                |
| `index`      | <pre>string</pre> | Index name for this action                |
| `collection` | <pre>string</pre> | Collection name for this action           |
| `_id`        | <pre>string</pre> | id for this action                        |
| `volatile`   | <pre>object</pre> | Additional information to send to Kuzzle |

**Note:**
 - If the `controller` property is not set, the controller [name property](/sdk/js/6/core-classes/base-controller/properties) will be used

### options

Additional query options

| Property     | Type<br/>(default)    | Description   |
| -------------- | --------- | ------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolve to the raw Kuzzle API response. See the [API Documentation](/core/1/api/essentials/connecting-to-kuzzle).
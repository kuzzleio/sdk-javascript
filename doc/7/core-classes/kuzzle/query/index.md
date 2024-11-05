---
code: true
type: page
title: query
description: Base method to send API query to Kuzzle
---

# query

Base method used to send queries to Kuzzle, following the [API Documentation](/core/2/api).

:::warning
This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
:::

## Arguments

```js
query(request, [options]);
```

<br/>

| Argument  | Type              | Description            |
| --------- | ----------------- | ---------------------- |
| `request` | <pre>object</pre> | API request            |
| `options` | <pre>object</pre> | Optional query options |

### request

All properties necessary for the Kuzzle API can be added in the request object.
The following properties are the most common.

| Property     | Type              | Description                              |
| ------------ | ----------------- | ---------------------------------------- |
| `controller` | <pre>string</pre> | Controller name (mandatory)              |
| `action`     | <pre>string</pre> | Action name (mandatory)                  |
| `body`       | <pre>object</pre> | Query body for this action               |
| `index`      | <pre>string</pre> | Index name for this action               |
| `collection` | <pre>string</pre> | Collection name for this action          |
| `_id`        | <pre>string</pre> | id for this action                       |
| `volatile`   | <pre>object</pre> | Additional information to send to Kuzzle |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

#### timeout

::: warn
    The **timeout** option can only be used to prevent the SDK from being frozen if Kuzzle take too long to resolve a request, this will not prevent the request from being executed and Kuzzle will still resolve it at some point.

#### triggerEvents

::: warn
    The **triggerEvents** option can only be used to prevent the EmbededSDK from escaping events such as a pipe or a hook. Use it can lead to infinite loop if used wrongly. (ex: a pipe on document creation that create a document that triggers same pipe again and again)

## Resolves

Resolve to the raw Kuzzle API response. See the [API Documentation](/core/2/api).

## Usage

<<< ./snippets/query.js

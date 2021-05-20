---
code: true
type: page
title: list
description: Returns the collection list of an index
---

# list

Returns the list of collections associated to a provided index.
The returned list is sorted in alphanumerical order.

<br/>

```js
list(index, [options]);
```

<br/>

| Arguments | Type              | Description   |
|-----------|-------------------|---------------|
| `index`   | <pre>string</pre> | Index name    |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
|------------|---------------------------------|------------------------------------------------------------------------------|
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `from`     | <pre>number</pre> <br/>(`0`)    | Offset of the first result <DeprecatedBadge version="7.1.4"/>                |
| `size`     | <pre>number</pre> <br/>(`10`)   | Maximum number of returned results <DeprecatedBadge version="7.1.4"/>     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout) | <pre>number</pre><br/>(`-1`) | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to an object containing the following properties:

| Property      | Type                | Description                                                        |
|---------------|---------------------|--------------------------------------------------------------------|
| `type`        | <pre>string</pre>   | Types of returned collections <br/>(`all`, `realtime` or `stored`) |
| `collections` | <pre>object[]</pre> | List of collections                                                |
| `from`        | <pre>number</pre>   | Offset of the first result <DeprecatedBadge version="7.1.4"/>                                        |
| `size`        | <pre>number</pre>   | Maximum number of returned results <DeprecatedBadge version="7.1.4"/>                                |

Each object in the `collections` array contains the following properties:

| Property | Type              | Description                              |
|----------|-------------------|------------------------------------------|
| `name`   | <pre>string</pre> | Collection name                          |
| `type`   | <pre>string</pre> | Collection type (`realtime` or `stored`) |

## Usage

<<< ./snippets/list.js

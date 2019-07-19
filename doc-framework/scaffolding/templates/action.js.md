---
layout: sdk.html.hbs
title: <%= _.camelCase(action) %>
description:
---

# <%= _.camelCase(action) %>

## Arguments

```js
<%= _.camelCase(action) %>()
```

<br/>

| Argument | Type | Description |
| --- | --- | --- |
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `id` | <pre>string</pre> | Optional document id |
| `body` | <pre>object</pre> | The query to match |
| `options` | <pre>object</pre> | An object containing query options. |

### options

| Option     | Type (default)    | Description                       |
| ---------- | ----------------- | --------------------------------- |
| `queuable` | <pre>boolean</pre> (`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>string</pre> | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolve

## Usage

[snippet=<%= _.kebabCase(action) %>]

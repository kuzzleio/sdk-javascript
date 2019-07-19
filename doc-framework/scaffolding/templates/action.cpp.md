---
layout: sdk.html.hbs
title: <%= _.camelCase(action) %>
description:
---

# <%= _.camelCase(action) %>

## Arguments

```cpp
void <%= _.camelCase(action) %>()
```

<br/>

| Argument | Type | Description |
| --- | --- | --- |
| `index` | <pre>std::string</pre> | Index name |
| `collection` | <pre>std::string</pre> | Collection name |
| `id` | <pre>std::string</pre> | The document id |
| `body` | <pre>std::string</pre> | A JSON string containing the body of the document |
| `options` | <pre>kuzzleio::query_options</pre> | A pointer to a `kuzzleio::query_options` containing query options |

### options

| Options    | Type (default) | Description                       |
| ---------- | -------------- | --------------------------------- |
| `queuable` | <pre>boolean</pre> (`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>std::string</pre> | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Return

## Exceptions

Throws a `KuzzleException` if there is an error. See how to [handle errors]({{ site_base_path }}sdk-reference/cpp/1/error-handling).

## Usage

[snippet=<%= _.kebabCase(action) %>]

---
layout: sdk.html.hbs
title: <%= _.camelCase(action) %>
description:
---

# <%= _.camelCase(action) %>

## Arguments

```java
void <%= _.camelCase(action) %>()
```

<br/>

| Argument | Type | Description |
| --- | --- | --- |
| `index` | <pre>String</pre> | Index name |
| `collection` | <pre>String</pre> | Collection name |
| `id` | <pre>String</pre> | Optional document id. If set to a blank string, will use a auto-generated id |
| `body` | <pre>String</pre> | A JSON string containing the body of the document |
| `options` | <pre>io.kuzzle.sdk.QueryOptions</pre> | The query options |

### Options

| Option     | Type (default) | Description                       |
| ---------- | -------------- | --------------------------------- |
| `queuable` | <pre>boolean</pre> (`true`) | Make this request queuable or not |
| `refresh` | <pre>String</pre> | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Return

## Exceptions

Throws a `io.kuzzle.sdk.KuzzleException` if there is an error. See how to [handle error]({{ site_base_path }}sdk-reference/java/1/error-handling).

## Usage

[snippet=<%= _.kebabCase(action) %>]

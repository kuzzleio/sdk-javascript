---
code: false
type: page
title: Properties
description: KuzzleError Properties
order: 10
---


# Properties

| Property name | Type              | Description                                                         |
|---------------|-------------------|---------------------------------------------------------------------|
| `kuzzleStack` | <pre>string</pre> | Kuzzle stacktrace (only in development mode)                        |
| `message`     | <pre>string</pre> | Error message                                                       |
| `status`      | <pre>number</pre> | Error status code                                                   |
| `stack`       | <pre>string</pre> | Complete error stacktrace (Kuzzle + SDK) (only in development mode) |
| `id`          | <pre>string</pre> | Error unique identifier                                             |
| `code`        | <pre>string</pre> | Error unique code                                                   |


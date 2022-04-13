---
code: false
type: page
title: Properties
description: KuzzleError Properties
order: 10
---


# Properties

| Property name | Type                | Description                                                                                          |
| ------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| `kuzzleStack` | <pre>string</pre>   | Kuzzle stacktrace (only in development mode)                                                         |
| `message`     | <pre>string</pre>   | Error message                                                                                        |
| `props`       | <pre>string[]</pre> | Placeholders used to construct the error message                                                     |
| `status`      | <pre>number</pre>   | Error status code                                                                                    |
| `stack`       | <pre>string</pre>   | Complete error stacktrace (Kuzzle + SDK) (only in development mode)                                  |
| `id`          | <pre>string</pre>   | Error unique identifier                                                                              |
| `code`        | <pre>string</pre>   | Error unique code                                                                                    |
| `controller`  | <pre>string</pre>   | API controller name                                                                                  |
| `action`      | <pre>string</pre>   | API action name                                                                                      |
| `volatile`    | <pre>object</pre>   | KuzzleRequest [volatile data](https://docs.kuzzle.io/core/2/guides/main-concepts/api/#volatile-data) |
| `index`       | <pre>string</pre>   | Index name                                                                                           |
| `collection`  | <pre>string</pre>   | Collection name name                                                                                 |
| `requestId`   | <pre>string</pre>   | request id name                                                                                      |
| `_id`         | <pre>string</pre>   | Document unique identifier                                                                           |
| `count`       | <pre>number</pre>   | Number of associated errors (PartialError only)                                                      |

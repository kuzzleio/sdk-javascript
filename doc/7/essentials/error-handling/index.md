---
code: false
type: page
title: Error Handling
description: How to handle errors with the SDK
order: 100
---

# Error Handling

All SDK methods return a promise, that can be rejected with a `KuzzleError` value in case of failure.

[KuzzleError](/sdk/js/7/core-classes/kuzzle-error/introduction) objects inherit the standard `Error` object, and add the following properties to it:

| Property      | Type              | Description                                  |
|---------------|-------------------|----------------------------------------------|
| `kuzzleStack` | <pre>string</pre> | Kuzzle stacktrace (only in development mode) |
| `status`      | <pre>number</pre> | Error status code                            |
| `id`          | <pre>string</pre> | Error unique identifier                      |
| `code`        | <pre>string</pre> | Error unique code                            |



You can find a detailed list of possible errors messages and statuses in the [documentation API](/core/2/api/errors/types).

#### Example with a promise chain

<<< ./snippets/error-handling.js

#### Example with async/await

<<< ./snippets/error-handling-async.js

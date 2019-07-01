---
code: false
type: page
title: Error Handling
description: How to handle errors with the SDK
order: 100
---

# Error Handling

All SDK methods return a promise, that can be rejected with a `KuzzleError` value in case of failure.

[KuzzleError](/sdk/js/6/core-classes/kuzzle-error/introduction/) objects inherit the standard `Error` object, and add the following properties to it:

| Property | Type              | Description                                                                                |
| -------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `status` | <pre>number</pre> | Status following [HTTP Standards](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) |
| `stack`  | <pre>string</pre> | Error stacktrace (Only in development mode)                                                |

You can find a detailed list of possible errors messages and statuses in the [documentation API](/core/1/api/essentials/errors).

#### Example with a promise chain

<<< ./snippets/error-handling.js

#### Example with async/await

<<< ./snippets/error-handling-async.js

---
code: true
type: page
title: Introduction
description: KuzzleError object
order: 0
---

# KuzzleError

Inherits from the standard `Error` class.

The KuzzleError class represents an [error response from Kuzzle API](/core/1/api/essentials/errors/).

## Properties

Available properties.

| Property name | Type              | Description                                 |
| ------------- | ----------------- | ------------------------------------------- |
| `message`     | <pre>string</pre> | Error message                               |
| `status`      | <pre>number</pre> | Error status code                           |
| `stack`       | <pre>string</pre> | Error stacktrace (only in development mode) |

---
code: true
type: page
title: connect
description: Connects the SDK to Kuzzle
---

# connect

Connects to Kuzzle using the `host` property provided in the [constructor options](/sdk/js/7/core-classes/kuzzle/constructor#arguments).
Subsequent call have no effect if the SDK is already connected.

::: info
You can use the `connectTimout` property of the Kuzzle object to set a timeout on the connection.  
The default timeout is `O` which mean no timeout.
:::

## Arguments

```js
connect();
```

## Resolves

Resolves if the connection is successful.

## Usage

<<< ./snippets/connect.js

---
code: true
type: page
title: connect
description: Connects the SDK to Kuzzle
---

# connect

Connects to Kuzzle using the `host` property provided in the [constructor options](/sdk/js/6/core-classes/kuzzle/constructor/#arguments-default).
Subsequent call have no effect if the SDK is already connected.

## Arguments

```javascript
connect();
```

## Resolves

Resolves if the connection is successful.

## Usage

<<< ./snippets/connect.js

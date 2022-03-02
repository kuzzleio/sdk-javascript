---
code: true
type: page
title: constructor
description: BatchController constructor method
---

# constructor

<SinceBadge version="auto-version" />

Instantiate a new BatchController.

Each instance will start a timer to periodicaly send batch requests.

## Arguments

```js
const batch = new BatchController(sdk, options);
```

<br/>

| Argument  | Type              | Description        |
| --------- | ----------------- | ------------------ |
| `sdk`     | <pre>Kuzzle</pre> | SDK instance       |
| `options` | <pre>object</pre> | Additional options |

## options

  * `interval`:  Timer interval in ms (10). Actions will be executed every {interval} ms
  * `maxWriteBufferSize`: Max write buffer size (200). (Should match config "limits.documentsWriteCount")
  * `maxReadBufferSize`: Max read buffer size (10000). (Should match config "limits.documentsReadCount")


---
code: false
type: page
title: replayQueue
description: Kuzzle:replayQueue
---

# replayQueue

Replays the requests queued during offline mode. Works only if the SDK is not in a `disconnected` state, and if the `autoReplay` option is set to `false`.

---

## Return Value

Returns the `Kuzzle` SDK object to allow chaining.

## Usage

<<< ./snippets/replay-queue-1.js

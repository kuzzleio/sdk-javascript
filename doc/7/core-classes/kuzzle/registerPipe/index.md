---
code: true
type: page
title: registerPipe
description: Register pipes around SDK actions
---

# registerPipe

Registers a callback function to be executed around a SDK action.

You can use this method to [extend the SDK functionalities](/sdk/js/7/essentials/extend-sdk).

::: warning
If the provided function take too long to return, the SDK action will abort.

This timeout is configurable on the [kuzzle object](/sdk/js/7/core-classes/kuzzle/properties) at `pipesTimeout`.
:::

## Arguments

```js
registerPipe(actionName, pipe);
```

### actionName

An action name to execute the pipe before or after.

See [available actions](/sdk/js/7/essentials/extend-sdk).

### pipe

A method that take one argument and must return either this argument or a promise resolving to it.

## Usage

<<< ./snippets/registerPipe.js

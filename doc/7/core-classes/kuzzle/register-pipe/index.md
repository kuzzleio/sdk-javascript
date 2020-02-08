---
code: true
type: page
title: registerPipe
description: Register pipes around SDK actions
---

# registerPipe

<SinceBadge version="7.1.0"/>

Registers a callback function to be executed around a SDK action.

*See also: [Modify SDK actions](/sdk/js/7/essentials/extend-sdk/register-pipe)*

::: warning
If the provided function take too long to return, the SDK action will abort.

This timeout is configurable on the [kuzzle object](/sdk/js/7/core-classes/kuzzle/constructor) at `pipesTimeout`.
:::

## Arguments

```js
registerPipe(actionName, description, callback);
```
<br/>

| Argument  | Type   | Description            |
| -------------- | --------- | ------------- |
| `actionName` | <pre>String</pre> | An action name to execute the pipe before or after. See [available actions](/sdk/js/7/essentials/extend-sdk/register-pipe/#available-actions).  |
| `description` | <pre>String</pre> | Pipe short description. |
| `callback` | <pre>Function</pre> | A method that take one argument and must return either this argument or a promise resolving to it. |

## Usage

<<< ./snippets/registerPipe.js

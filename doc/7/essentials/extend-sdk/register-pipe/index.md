---
code: false
type: page
title: Register Pipe
description: Modify SDK actions by registering pipes
order: 200
---

## Modify SDK actions

<SinceBadge version="7.1.0"/>

You can modify existing SDK actions behavior by registering pipes before or after these actions.  

A pipe is a callback method taking the same parameter as the action it is hooked on.  
Pipes have to return this parameter either directly or through a promise resolving to it.  

Pipes have to be registered using the [Kuzzle.registerPipe](/sdk/js/7/core-classes/kuzzle/register-pipe) method.

## Pipes timeout

If a pipe take too long to be executed, Kuzzle will throw an error and abort the action execution.  

This timeout can be configured in the [Kuzzle object constructor](/sdk/js/7/core-classes/kuzzle/constructor)

## Available actions

For each actions, the callback will be called with a different payload.  

The following actions are availables:

### kuzzle:query:before

Register a pipe on this action to modify the request before it is sent to Kuzzle or queued in offline mode.

#### Callback arguments

```js
callback(request);
```

</br>

| Argument  | Type   | Description            |
| -------------- | --------- | ------------- |
| `request` | <pre>Object</pre> | [Request object](/core/2/api/essentials/query-syntax/#other-protocols) before being sent to Kuzzle. |

#### Usage

<<< ./snippets/kuzzleQueryBefore.js

### kuzzle:query:after

Register a pipe on this action to modify the response sent by Kuzzle.

#### Callback arguments

```js
callback(response);
```

</br>

| Argument  | Type   | Description            |
| -------------- | --------- | ------------- |
| `request` | <pre>Object</pre> | [Response object](/core/2/api/essentials/kuzzle-response/) sent by Kuzzle. |

#### Usage

<<< ./snippets/kuzzleQueryAfter.js



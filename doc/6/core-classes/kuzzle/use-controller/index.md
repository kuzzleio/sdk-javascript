---
code: true
type: page
title: useController
description: Adds a new controller to the SDK
---

# useController

Adds a new controller to the SDK. 

*See also:* 
  - *[Extend the SDK](/sdk/js/6/essentials/extend-sdk)*

## Arguments

```js
useController (ControllerClass, accessor);
```

<br/>

| Argument  | Type   | Description            |
| -------------- | --------- | ------------- |
| `ControllerClass` | <pre>Class</pre> | Controller class. Must inherit from [BaseController](/sdk/js/6/core-classes/base-controller)    |
| `accessor` | <pre>string</pre> | Accessor name for the controller in the Kuzzle object |

## Returns

Returns the Kuzzle object.

## Usage

<<< ./snippets/use-controller.js
---
code: true
type: page
title: constructor
description: Creates a new Observer object
order: 50
---

# Constructor

Use this constructor to create a new Observer instance.

## Arguments

```js
Observer(sdk, [options]);
```

<br/>

| Argument  | Type              | Description                    |
|-----------|-------------------|--------------------------------|
| `sdk`     | <pre>Kuzzle</pre> | SDK instanciated and connected |
| `options` | <pre>object</pre> | Additional options             |

### options

Observer options.

| Property       | Type<br/>(default)             | Description                                                  |
|----------------|--------------------------------|--------------------------------------------------------------|
| `pullingDelay` | <pre>number</pre><br/>(`5000`) | Refresh delay in ms when the SDK is using the HTTP protocol. |

## Usage

```js
const observer = new Observer(sdk);
```
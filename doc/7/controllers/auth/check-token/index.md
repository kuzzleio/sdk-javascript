---
code: true
type: page
title: checkToken
description: Checks a JWT's validity.
---

# checkToken

Checks a token validity.  

If no token is provided, the SDK checks its internal authentication token.

<br/>

```js
checkToken([token]);
```

<br/>

| Property | Type              | Description |
| -------- | ----------------- | ----------- |
| `token`  | <pre>string</pre> | Optional authentication token   |
| `options`     | <pre>object</pre> | Query options   |
### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An `object` representing the token validity status

| Name          | Type               | Description                       |
| ------------- | ------------------ | --------------------------------- |
| `valid`       | <pre>boolean</pre> | Tell if the token is valid or not |
| `state`       | <pre>string</pre>  | Explain why the token is invalid  |
|  `expiresAt` | <pre>number</pre>  | Token expiration timestamp        |

## Usage

<<< ./snippets/check-token.js

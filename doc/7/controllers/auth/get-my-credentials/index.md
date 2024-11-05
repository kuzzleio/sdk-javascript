---
code: true
type: page
title: getMyCredentials
description: Returns the current user's credential information for the specified strategy.
---

# getMyCredentials

Returns credentials information for the currently logged in user.

The returned data depends on the given authentication strategy, and should never include any sensitive information.

The result can be an empty object.

<br/>

```js
getMyCredentials(strategy, [options]);
```

<br/>

| Arguments  | Type              | Description     |
| ---------- | ----------------- | --------------- |
| `strategy` | <pre>string</pre> | Strategy to use |
| `options`  | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An `object` representing the credentials for the provided authentication strategy.
Its content depends on the authentication strategy.

## Usage

<<< ./snippets/get-my-credentials.js

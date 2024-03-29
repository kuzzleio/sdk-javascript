---
code: true
type: page
title: updateMyCredentials
description: Update the current user's credentials for the specified strategy.
---

# updateMyCredentials

Updates the credentials of the currently logged in user for the specified strategy.

<br/>

```js
updateMyCredentials(strategy, credentials, [options]);
```

<br/>

| Arguments     | Type              | Description     |
| ------------- | ----------------- | --------------- |
| `strategy`    | <pre>string</pre> | Strategy to use |
| `credentials` | <pre>object</pre> | New credentials |
| `options`     | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

An `object` representing the new credentials.
The content depends on the authentication strategy.

## Usage

<<< ./snippets/update-my-credentials.js

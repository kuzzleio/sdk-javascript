---
code: true
type: page
title: credentialsExist
description: Check that the current user has credentials for the specified strategy
---

# credentialsExist

Checks that the current authenticated user has credentials for the specified authentication strategy.

<br/>

```js
credentialsExist(strategy, [options]);
```

<br/>

| Arguments | Type              | Description     |
| --------- | ----------------- | --------------- |
| `local`   | <pre>string</pre> | Strategy to use |
| `options` | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to `true` if the credentials exist, `false` otherwise.

## Usage

<<< ./snippets/credentials-exist.js

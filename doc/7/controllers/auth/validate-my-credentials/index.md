---
code: true
type: page
title: validateMyCredentials
description: Validate the current user's credentials for the specified strategy.
---

# validateMyCredentials

Validates the provided credentials against a specified authentication strategy.

This route neither creates nor modifies credentials.

<br/>

```js
validateMyCredentials(strategy, [credentials], [options]);
```

<br/>

| Arguments     | Type              | Description     |
| ------------- | ----------------- | --------------- |
| `strategy`    | <pre>string</pre> | Strategy to use |
| `credentials` | <pre>object</pre> | Credentials     |
| `options`     | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to `true` if the credentials are valid, `false` otherwise.

## Usage

<<< ./snippets/validate-my-credentials.js

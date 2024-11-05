---
code: true
type: page
title: deleteApiKey
description: Deletes a user's API key.
---

# deleteApiKey

<SinceBadge version="7.1.0" />

<SinceBadge version="Kuzzle 2.1.0" />

Deletes a user's API key.

<br />

```js
deleteApiKey(userId, id, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `userId` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `id` | <pre>string</pre> | API key unique ID |
| `options` | <pre>object</pre> | Additional options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the API key is indexed |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
## Resolves

Resolves if the API key is successfully deleted.

## Usage

<<< ./snippets/delete-api-key.js

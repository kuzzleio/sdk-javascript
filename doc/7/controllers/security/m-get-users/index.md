---
code: true
type: page
title: mGetUsers
description: Gets multiple security users
---

# mGetUsers

Gets multiple security users.

<br />

```js
mGetUsers(kuids, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `ids` | <pre>string[]</pre> | User identifiers |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
| `verb`     | <pre>string</pre> | (HTTP only) Forces the verb of the API route |

#### verb

When instantiated with a HTTP protocol object, the SDK uses the GET API by default for this API route.
You can set the `verb` option to `POST` to force the SDK to use the POST API instead.

## Resolves

An array of retrieved [`User`](/sdk/js/7/core-classes/user/introduction) objects.

## Usage

<<< ./snippets/m-get-users.js

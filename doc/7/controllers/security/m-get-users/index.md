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
| `queuable` | <pre>boolean</pre> | If true, queues the request during downtime, until connected to Kuzzle again |
| `verb`     | <pre>string</pre> | (HTTP only) Forces the verb of the API route |

#### verb

When instantiated with a HTTP protocol object, the SDK uses the GET API by default for this API route.
You can set the `verb` option to `POST` to force the SDK to use the POST API instead.

## Resolves

An array of retrieved [`User`](/sdk/js/7/core-classes/user/introduction) objects.

## Usage

<<< ./snippets/m-get-users.js

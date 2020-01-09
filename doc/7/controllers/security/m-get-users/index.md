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
mGetUsers(ids, [options]);
```
The route exists in `GET` and `POST`.
By default, the SDK hits the `GET` one.
You can force it to be `POST` in the `options`.

<br />

| Property | Type | Description |
|--- |--- |--- |
| `ids` | <pre>array&lt;string&gt;</pre> | User identifiers |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `verb`     | <pre>string</pre>      | Forces the verb of the route |

## Resolves

An array of retrieved [`User`](/sdk/js/6/core-classes/user/introduction) objects.

## Usage

<<< ./snippets/m-get-users.js
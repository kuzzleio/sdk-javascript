---
code: true
type: page
title: getMyRights
description: Returns the rights for the user linked to the `JSON Web Token`.
---

# getMyRights

Returns the exhaustive list of granted or denied rights for the currently logged in user.

<br/>

```js
getMyRights([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                       |
| ---------- | ------------------------------- | --------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

An array containing user rights objects.

Each user right object has the following properties:

| Property      | Type              | Description                                 |
| ------------- | ----------------- | ------------------------------------------- |
| `controller`  | <pre>string</pre> | Controller on wich the rights are applied   |
| `action`      | <pre>string</pre> | Action on wich the rights are applied       |
| `index`       | <pre>string</pre> | Index on wich the rights are applied        |
|  `collection` | <pre>string</pre> | Collection on wich the rights are applied   |
|  `value`      | <pre>string</pre> | Rights (`allowed`, `denied`, `conditional`) |

## Usage

<<< ./snippets/get-my-rights.js

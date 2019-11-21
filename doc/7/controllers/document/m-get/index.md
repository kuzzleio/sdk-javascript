---
code: true
type: page
title: mGet
description: Get multiple documents
---

# mGet

Gets multiple documents.

<br/>

```js
mGet(index, collection, ids, [options]);
```

The route exists in `GET` and `POST`.
By default, the SDK hits the `GET` one.
You can force it to be `POST` in the `options`.


| Argument     | Type            | Description     |
| ------------ | --------------- | --------------- |
| `index`      | <pre>string</pre>        | Index name      |
| `collection` | <pre>string</pre>        | Collection name |
| `ids`        | <pre>string[]</pre> | Document ids    |
| `options`    | <pre>object</pre>        | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `verb`     | <pre>string</pre>      | Forces the verb of the route |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

The `successes` array contain the list of retrieved documents.

Each document have with following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | Document ID                    |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |

The `errors` array contain the IDs of not found documents.

## Usage

<<< ./snippets/m-get.js

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


| Argument     | Type                | Description     |
| ------------ | ------------------- | --------------- |
| `index`      | <pre>string</pre>   | Index name      |
| `collection` | <pre>string</pre>   | Collection name |
| `ids`        | <pre>string[]</pre> | Document ids    |
| `options`    | <pre>object</pre>   | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| `verb`     | <pre>string</pre>               | (HTTP only) Forces the verb of the route                                                                              |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

#### verb

When instantiated with a HTTP protocol object, the SDK uses the GET API by default for this API route.
You can set the `verb` option to `POST` to force the SDK to use the POST API instead.

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

The `successes` array contain the list of retrieved documents.

Each document have the following properties:

| Name       | Type              | Description                                            |
| ---------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | Document ID                                            |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |

The `errors` array contain the IDs of not found documents.

## Usage

<<< ./snippets/m-get.js

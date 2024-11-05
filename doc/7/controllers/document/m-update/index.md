---
code: true
type: page
title: mUpdate
description: Update documents
---

# mUpdate

Updates multiple documents.

Conflicts may occur if the same document gets updated multiple times within a short timespan in a database cluster.

You can set the `retryOnConflict` optional argument (with a retry count), to tell Kuzzle to retry the failing updates the specified amount of times before rejecting the request with an error.

<br/>

```js
mUpdate(index, collection, documents, [options]);
```

| Argument     | Type                | Description                  |
| ------------ | ------------------- | ---------------------------- |
| `index`      | <pre>string</pre>   | Index name                   |
| `collection` | <pre>string</pre>   | Collection name              |
| `documents`  | <pre>object[]</pre> | Array of documents to update |
| `options`    | <pre>object</pre>   | Query options                |

### Options

Additional query options

| Options           | Type<br/>(default)               | Description                                                                                                           |
| ----------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable`        | <pre>boolean</pre><br/>(`true`)  | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| `refresh`         | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                    |
| `retryOnConflict` | <pre>int</pre><br/>(`0`)         | The number of times the database layer should retry in case of version conflict                                       |
| `silent`          | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="7.5.3"/>                                  |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each updated document is an object of the `successes` array with the following properties:

| Name       | Type              | Description                                            |
| ---------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | Document ID                                            |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |

Each errored document is an object of the `errors` array with the following properties:

| Name       | Type              | Description                   |
| ---------- | ----------------- | ----------------------------- |
| `document` | <pre>object</pre> | Document that cause the error |
| `status`   | <pre>number</pre> | HTTP error status             |
| `reason`   | <pre>string</pre> | Human readable reason         |

## Usage

<<< ./snippets/m-update.js

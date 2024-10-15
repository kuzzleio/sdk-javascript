---
code: true
type: page
title: mDelete
description: Delete documents
---

# mDelete

Deletes multiple documents.

The optional parameter `refresh` can be used with the value `wait_for` in order to wait for the document indexation (indexed documents are available for `search`).

<br/>

```js
mDelete(index, collection, ids, [options]);
```

| Argument     | Type                | Description                    |
| ------------ | ------------------- | ------------------------------ |
| `index`      | <pre>string</pre>   | Index name                     |
| `collection` | <pre>string</pre>   | Collection name                |
| `ids`        | <pre>string[]</pre> | IDs of the documents to delete |
| `options`    | <pre>object</pre>   | Query options                  |

### Options

Additional query options

| Options    | Type<br/>(default)               | Description                                                                                                           |
| ---------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`)  | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| `refresh`  | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                    |
| `silent`   | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="7.5.3"/>                                  |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

The `successes` array contain the successfuly deleted document IDs.

Each deletion error is an object of the `errors` array with the following properties:

| Name     | Type              | Description           |
| -------- | ----------------- | --------------------- |
| `id`     | <pre>string</pre> | Document ID           |
| `reason` | <pre>string</pre> | Human readable reason |

## Usage

<<< ./snippets/m-delete.js

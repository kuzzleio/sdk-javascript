---
code: false
type: page
title: setAutoRefresh
description: Kuzzle:setAutoRefresh
---

# setAutoRefresh

The `autoRefresh` flag, when set to true, will make Kuzzle perform a
[`refresh`](https://www.elastic.co/guide/en/elasticsearch/reference/5.4/docs-refresh.html) request
immediately after each write request, causing documents to be immediately visible in a search.

Given an index, the `setAutoRefresh` function updates its `autoRefresh` status.

<div class="alert alert-warning">
    <p>
        A refresh operation comes with some performance costs.
    </p>
    <p>
        While forcing the autoRefresh can be convenient on a development or test environmnent, we recommend that you avoid
        using it in production or at least carefully monitor its implications before using it.
    </p>
</div>

---

## setAutoRefresh([index], autoRefresh, [options], [callback])

| Argument      | Type        | Description                                                                                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `index`       | string      | _Optional_ The index to set the `autoRefresh` for. If not set, defaults to [kuzzle.defaultIndex](/sdk/js/5/core-classes/kuzzle/#properties). |
| `autoRefresh` | boolean     | The value to set for the `autoRefresh` setting.                                                                                 |
| `options`     | JSON object | Optional parameters                                                                                                             |
| `callback`    | function    | _Optional_ Callback handling the response                                                                                       |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `Kuzzle` SDK object to allow chaining.

---

## Callback Response

Returns a boolean with the new `autoRefresh` status.

## Usage

<<< ./snippets/set-auto-refresh-1.js

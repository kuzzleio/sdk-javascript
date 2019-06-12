---
code: false
type: page
title: update
description: Role:update
---

# update

Updates the role object in Kuzzle.

<div class="alert alert-warning">
  <p>
    Unlike a regular document update, this method will replace the whole role definition under the indexes node with the <code>updateContent</code> parameter.<br>
    In other words, you always need to provide the complete role definition in the <code>updateContent</code> object.
  </p>
  <p>
    This method has the same effect as calling [`setContent`](/sdk/js/5/core-classes/role/set-content) followed by the [`save`](/sdk/js/5/core-classes/role/save) method.
  </p>
</div>

To get more information about Kuzzle permissions, please refer to our [permissions guide](/core/1/guides/essentials/security/#user-permissions).

---

## update(content, [options], [callback])

| Arguments  | Type        | Description                             |
| ---------- | ----------- | --------------------------------------- |
| `content`  | JSON Object | New role content                        |
| `options`  | JSON Object | Optional parameters                     |
| `callback` | function    | Optional callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `Role` object to allow chaining.

---

## Callback Response

Returns the updated version of this object.

## Usage

<<< ./snippets/update-1.js

---
code: false
type: page
title: setContent
description: User:setContent
---

# setContent

Replaces the content of User.

<div class="alert alert-info">
Updating a user will have no impact until the [`create`](/sdk/js/5/core-classes/user/create) or [`replace`](/sdk/js/5/core-classes/user/replace) method is called
</div>

---

## setContent(data)

| Arguments | Type        | Description  |
| --------- | ----------- | ------------ |
| `data`    | JSON Object | User content |

---

## Return Value

Returns the `User` object.

## Usage

<<< ./snippets/set-content-1.js

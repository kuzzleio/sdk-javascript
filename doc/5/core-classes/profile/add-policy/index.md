---
code: false
type: page
title: addPolicy
description: Profile:addPolicy
---

# addPolicy

Adds a role to the security profile.

<div class="alert alert-info">
Updating a security profile will have no impact until the [save](/sdk/js/5/core-classes/profile/save) method is called
</div>

---

## addPolicy(id)

| Arguments | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| `id`      | string | Unique id of the new role to associate |

---

## addPolicy(policy)

| Arguments | Type        | Description                                                                   |
| --------- | ----------- | ----------------------------------------------------------------------------- |
| `policy`  | JSON Object | policy instance corresponding to the new associated role and its restrictions |

---

## Return Value

Returns the `Profile` object to allow chaining calls.

## Usage

<<< ./snippets/add-policy-1.js

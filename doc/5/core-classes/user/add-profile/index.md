---
code: false
type: page
title: addProfile
description: User:addProfile
---

# addProfile

Replaces the security profile associated with the user.

<div class="alert alert-info">
Updating a user will have no impact until the [`create`](/sdk/js/5/core-classes/user/create) or [`replace`](/sdk/js/5/core-classes/user/replace) method is called
</div>

---

## addProfile(profileId)

| Arguments   | Type   | Description |
| ----------- | ------ | ----------- |
| `profileId` | string | Profile ID  |

---

## addProfile(profile)

| Arguments | Type    | Description                                         |
| --------- | ------- | --------------------------------------------------- |
| `profile` | Profile | An instantiated [Profile](/sdk/js/5/core-classes/profile) object |

---

## Return Value

Returns the `User` object.

## Usage

<<< ./snippets/add-profile-1.js

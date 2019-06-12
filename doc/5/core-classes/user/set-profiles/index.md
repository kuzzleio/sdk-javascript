---
code: false
type: page
title: setProfiles
description: User:setProfiles
---

# setProfiles

Replaces the security profiles linked to the user.

<div class="alert alert-info">
Updating a user will have no impact until the <code>create</code> or <code>replace</code> method is called
</div>
---

## setProfiles(profileIds)

| Arguments    | Type             | Description         |
| ------------ | ---------------- | ------------------- |
| `profileIds` | array of strings | List of profile IDs |

---

## setProfiles(profiles)

| Arguments  | Type                     | Description                                                   |
| ---------- | ------------------------ | ------------------------------------------------------------- |
| `profiles` | array of Profile objects | An array of instantiated [Profile](/sdk/js/5/core-classes/profile) objects |

---

## Return Value

Returns the `User` object.

## Usage

<<< ./snippets/set-profiles-1.js

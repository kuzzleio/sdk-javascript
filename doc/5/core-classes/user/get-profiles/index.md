---
code: false
type: page
title: getProfiles
description: User:getProfiles
---

# getProfiles

Gets the security [Profile](/sdk/js/5/core-classes/profile) instances linked to the user from Kuzzle's API.

---

## getProfiles([options], callback)

| Arguments  | Type        | Description                    |
| ---------- | ----------- | ------------------------------ |
| `options`  | JSON Object | Optional parameters            |
| `callback` | function    | Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array of security [Profile](/sdk/js/5/core-classes/profile) objects.

## Usage

<<< ./snippets/get-profiles-1.js

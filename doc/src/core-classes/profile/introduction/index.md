---
code: true
type: page
title: Introduction
description: Profile class
order: 0
---

# Profile

This class represents a Kuzzle Profile.

Refer to the [Security guide](/core/1/guide/guides/essentials/security/#defining-profiles-default) for more information about profiles.

## Properties

Available properties:

| Property   | Type                | Description                        |
| ---------- | ------------------- | ---------------------------------- |
| `_id`      | <pre>string</pre>   | Profile ID                         |
| `policies` | <pre>object[]</pre> | Array of policies for this profile |

Each policy object can contain the following properties:

| Property       | Type                | Description                                                                           |
| -------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `roleId`       | <pre>string</pre>   | Roles IDs for this user                                                               |
| `restrictedTo` | <pre>object[]</pre> | Array of object containing indexes and collections which the profile is restricted to |

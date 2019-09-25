---
code: false
type: page
title: Properties
description: Profile Properties
order: 10
---

# Properties

| Property | Type | Description |
|--- |--- |--- |
| `_id` | <pre>string</pre> | Profile ID |
| `policies` | <pre>object[]</pre> | Array of policies for this profile |

### policies

Each policy object can contain the following properties:

| Property | Type | Description |
|--- |--- |--- |
| `roleId` | <pre>string</pre> | Roles IDs for this user |
| `restrictedTo` | <pre>object[]</pre> | Array of object containing indexes and collections which the profile is restricted to |

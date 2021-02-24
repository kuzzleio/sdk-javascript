---
code: false
type: page
title: Properties
description: User class properties
order: 10
---

# Properties


| Property  | Type              | Description                                                   |
|-----------|-------------------|---------------------------------------------------------------|
| `_id`     | <pre>string</pre> | User ID (kuid)                                                |
| `_source` | <pre>object</pre> | User internal content <SinceBadge since="auto-version"/>      |
| `content` | <pre>object</pre> | User internal content <DeprecatedBadge since="auto-version"/> |

### _source

The `_source` property is an object containing, alongside custom defined values, the following generic properties:

| Property       | Type                | Description                                                                  |
|----------------|---------------------|------------------------------------------------------------------------------|
| `profileIds`   | <pre>string[]</pre> | Profiles IDs for this user                                                   |
| `_kuzzle_info` | <pre>object</pre>   | [Kuzzle metadata](/core/2/guides/main-concepts/data-storage#kuzzle-metadata) |

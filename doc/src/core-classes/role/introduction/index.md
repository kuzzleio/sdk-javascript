---
code: true
type: page
title: Introduction
description: Role class
order: 0
---

# Role

This class represents a Kuzzle Role.

Refer to the [Security guide](/core/1/guide/guides/essentials/security/#defining-roles-default) for more information about roles.

## Properties

Available properties:

| Property      | Type              | Description                                                |
| ------------- | ----------------- | ---------------------------------------------------------- |
| `_id`         | <pre>string</pre> | Role ID                                                    |
| `controllers` | <pre>object</pre> | Object defining controllers action available for this role |

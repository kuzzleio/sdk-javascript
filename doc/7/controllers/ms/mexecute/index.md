---
code: true
type: page
title: mexecute
---

# mexecute

Allows the execution of multiple commands or 'actions' in a single step.

It creates a redis **transaction** block and **executes** it immediately, all actions will be executed sequentially and as a single atomic and isolated operation.

[[_Redis documentation_]](https://redis.io/topics/transactions)

::: warning
Only already supported actions can be executed using **mexecute**.
:::

## Arguments

```js
mexecute(actions, [options]);
```

<br/>

| Arguments | Type                | Description                    |
| --------- | ------------------- | ------------------------------ |
| `actions` | <pre>object[]</pre> | List of actions to execute     |
| `options` | <pre>object</pre>   | Optional query arguments       |

### actions

The `actions` argument is an array of objects. Each object describes an action to be executed, using the following properties:

| Property | Type              | Description |
| -------- | ----------------- | ----------- |
| `action` | <pre>string</pre> | Action name |
| `args`   | <pre>object</pre> | Arguments   |

## Resolve

Returns an array of error & result pairs for each executed action, in order.

## Usage

<<< ./snippets/mexecute.js

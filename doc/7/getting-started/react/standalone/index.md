---
code: false
type: page
title: Standalone
description: Getting started with Kuzzle and React
order: 100
---

# Getting Started with Kuzzle and React

This tutorial explains how to use **Kuzzle** with the **Javascript SDK 7** and **React**.

You are going to write a realtime chat: messages are stored as **documents** in Kuzzle, and every client is kept up to date through [document notifications](/sdk/js/7/essentials/realtime-notifications#document-messages).

To follow this tutorial, you must have a Kuzzle Server up and running. Follow these instructions if this is not already the case: [Running Kuzzle](/core/2/guides/getting-started/run-kuzzle).

:::info
Having trouble? Get in touch with us on [Discord](http://join.discord.kuzzle.io)!
:::

## Requirements

- **Node.js** >= 20 ([download page](https://nodejs.org/en/download/))
- a **running Kuzzle V2 stack** ([instructions here](/core/2/guides/getting-started/run-kuzzle))

## Prepare your environment

Create a React application with [Vite](https://vite.dev/) and install the Javascript SDK:

```bash
npm create vite@latest kuzzle-playground -- --template react
cd kuzzle-playground
npm install
npm install kuzzle-sdk@7
```

You can now empty `src/App.jsx` and `src/App.css`: we are going to rewrite them.

## Instantiating the SDK

The SDK client holds the network connection, so the whole application must share a single instance.

Create a `src/services/kuzzle.js` file:

<<< ./snippets/kuzzle.js

:::info
Replace `localhost` with the hostname of the machine running your Kuzzle server.
:::

## Connecting and loading the messages

Everything that talks to Kuzzle lives in a single custom hook. Create a `src/useChat.js` file:

<<< ./snippets/useChat.js

This hook does the following, once the user has chosen a nickname:

- [connects](/sdk/js/7/core-classes/kuzzle/connect) the SDK to Kuzzle,
- creates the `chat` [index](/sdk/js/7/controllers/index/create) and the `messages` [collection](/sdk/js/7/controllers/collection/create) if they don't [exist](/sdk/js/7/controllers/index/exists) yet,
- [subscribes](/sdk/js/7/controllers/realtime/subscribe) to the collection, so that every message created by any client is prepended to the local state,
- [searches](/sdk/js/7/controllers/document/search) for the hundred most recent messages to fill the history,
- exposes a `sendMessage` function that [creates](/sdk/js/7/controllers/document/create) a new document.

:::info
The subscription is opened **before** the history is fetched, and the cleanup function [unsubscribes](/sdk/js/7/controllers/realtime/unsubscribe) when the component unmounts. This way no message can slip through between the two calls, and React's Strict Mode does not leave a dangling room behind.
:::

Note that `sendMessage` does not touch the local state: the new message comes back through the realtime notification, exactly like the ones sent by the other clients.

## Displaying the messages

Create a `src/Message.jsx` component to render a single message:

<<< ./snippets/Message.jsx

Then add the styles in `src/App.css`:

<<< ./snippets/App.css

## Putting it together

Finally, rewrite `src/App.jsx`. It asks for a nickname, then displays the message list and the input used to send new ones:

<<< ./snippets/App.jsx

Launch the application:

```bash
npm run dev
```

:::success
Open the printed URL in two different browser tabs, pick a different nickname in each one, and send a message: it shows up in both tabs instantly, pushed by Kuzzle.
:::

## Going further

Now that you are more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- Follow the [React with Redux](/sdk/js/7/getting-started/react/with-redux) tutorial to move this state into a Redux store
- Discover what this SDK has to offer by browsing other sections of this documentation
- Learn more about Kuzzle [realtime engine](/core/2/guides/main-concepts/realtime-engine)
- Learn how to use the Kuzzle [Admin Console](http://console.kuzzle.io) to manage your users and data
- Learn how to use [Koncorde](/core/2/api/koncorde-filters-syntax) to create incredibly fine-grained and blazing-fast subscriptions
- Follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/2/guides/main-concepts/permissions)

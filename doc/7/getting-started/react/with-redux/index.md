---
code: false
type: page
title: React with Redux
description: Getting started with Kuzzle and React with Redux Toolkit
order: 200
---

# Getting Started with Kuzzle and React with Redux

This tutorial explains how to use **Kuzzle** with the **Javascript SDK 7**, **React** and **Redux** (through [Redux Toolkit](https://redux-toolkit.js.org/)).

It builds the same realtime chat as the [standalone React tutorial](/sdk/js/7/getting-started/react/standalone), but the messages live in a Redux store instead of a component state. Messages are stored as **documents** in Kuzzle, and every client is kept up to date through [document notifications](/sdk/js/7/essentials/realtime-notifications#document-messages).

To follow this tutorial, you must have a Kuzzle Server up and running. Follow these instructions if this is not already the case: [Running Kuzzle](/core/2/guides/getting-started/run-kuzzle).

:::info
Having trouble? Get in touch with us on [Discord](http://join.discord.kuzzle.io)!
:::

## Requirements

- **Node.js** >= 20 ([download page](https://nodejs.org/en/download/))
- a **running Kuzzle V2 stack** ([instructions here](/core/2/guides/getting-started/run-kuzzle))

## Prepare your environment

Create a React application with [Vite](https://vite.dev/) and install the Javascript SDK along with Redux:

```bash
npm create vite@latest kuzzle-playground -- --template react
cd kuzzle-playground
npm install
npm install kuzzle-sdk@7 @reduxjs/toolkit react-redux
```

:::info
This tutorial uses **Redux Toolkit**, which is the approach [recommended by the Redux team](https://redux.js.org/introduction/why-rtk-is-redux-today). The hand-written action types, switch reducers and `redux-saga` middleware of the older tutorials are no longer needed.
:::

## Instantiating the SDK

The SDK client holds the network connection, so the whole application must share a single instance.

Create a `src/services/kuzzle.js` file:

<<< ./snippets/kuzzle.js

:::info
Replace `localhost` with the hostname of the machine running your Kuzzle server.
:::

## Creating the store

The store holds the message list. We need a slice with:

- a `messageReceived` reducer, fed by the realtime subscription,
- a `fetchMessages` thunk that [searches](/sdk/js/7/controllers/document/search) for the existing messages,
- a `sendMessage` thunk that [creates](/sdk/js/7/controllers/document/create) a document.

Create a `src/state/messagesSlice.js` file:

<<< ./snippets/messagesSlice.js

Note that `sendMessage` does not add anything to the store: the new message comes back through the realtime notification, exactly like the ones sent by the other clients. There is a single code path for every message, wherever it comes from.

Then declare the store itself in `src/state/store.js`:

<<< ./snippets/store.js

And make it available to the whole application by wrapping it in a `Provider`, in `src/main.jsx`:

<<< ./snippets/main.jsx

## Connecting to Kuzzle

All the Kuzzle lifecycle lives in a single hook, which dispatches into the store. Create a `src/useKuzzleSync.js` file:

<<< ./snippets/useKuzzleSync.js

Once the user has chosen a nickname, this hook:

- [connects](/sdk/js/7/core-classes/kuzzle/connect) the SDK to Kuzzle,
- creates the `chat` [index](/sdk/js/7/controllers/index/create) and the `messages` [collection](/sdk/js/7/controllers/collection/create) if they don't [exist](/sdk/js/7/controllers/index/exists) yet,
- [subscribes](/sdk/js/7/controllers/realtime/subscribe) to the collection and dispatches `messageReceived` on every document creation,
- dispatches `fetchMessages` to fill the history.

:::info
The subscription is opened **before** the history is fetched, and the cleanup function [unsubscribes](/sdk/js/7/controllers/realtime/unsubscribe) when the component unmounts. This way no message can slip through between the two calls, and React's Strict Mode does not leave a dangling room behind.
:::

## Displaying the messages

Create a `src/Message.jsx` component to render a single message:

<<< ./snippets/Message.jsx

Then add the styles in `src/App.css`:

<<< ./snippets/App.css

## Putting it together

Finally, rewrite `src/App.jsx`. It reads the messages from the store with `useSelector`, and sends new ones by dispatching the `sendMessage` thunk:

<<< ./snippets/App.jsx

Launch the application:

```bash
npm run dev
```

:::success
Open the printed URL in two different browser tabs, pick a different nickname in each one, and send a message: it shows up in both tabs instantly, pushed by Kuzzle. Install the [Redux DevTools](https://github.com/reduxjs/redux-devtools) extension to watch the `messages/messageReceived` actions as they arrive.
:::

## Going further

Now that you are more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- Discover what this SDK has to offer by browsing other sections of this documentation
- Learn more about Kuzzle [realtime engine](/core/2/guides/main-concepts/realtime-engine)
- Learn how to use the Kuzzle [Admin Console](http://console.kuzzle.io) to manage your users and data
- Learn how to use [Koncorde](/core/2/api/koncorde-filters-syntax) to create incredibly fine-grained and blazing-fast subscriptions
- Follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/2/guides/main-concepts/permissions)

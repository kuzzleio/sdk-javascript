---
type: page
code: false
title: React with Redux
description: Getting started with Kuzzle and React with Redux
order: 0
---


# Getting Started with Kuzzle and React with Redux Saga

This section deals with **Kuzzle V2** (+ **Javascript SDK 7**) and **React** (with **Redux** and **Redux Saga**). We will create **documents** in Kuzzle and subscribe to [document notifications](/essentials/realtime-notifications/#document-messages) to develop a realtime chat.

## Requirements

- **Node.js** >= 8.0.0 ([install here](https://nodejs.org/en/download/))
- **Create React App** ([install here](https://github.com/facebook/create-react-app))
- **Running Kuzzle V2 Stack** ([instructions here](/core/2/guides/getting-started/running-kuzzle))

## Prepare your environment

Create your React app and install all the dependencies from the command line using yarn:

```bash
yarn create react-app kuzzle-playground
cd kuzzle-playground
yarn add kuzzle-sdk@7 redux redux-saga react-redux
```

We'll rewrite the _src/App.js_ so you can remove everything inside.

## Instantiating Kuzzle SDK

We have to connect the server so that our client can interact with it.

To do this, we have to create _src/services/kuzzle.js_ file to put our kuzzle instance, a bit like a singleton:

<<< ./snippets/kuzzle.js.snippet[js]

You can now edit the _src/App.js_ file to connect to Kuzzle.
To do this, import the kuzzle service file:

<<< ./snippets/App.js.snippet:1[js]

Add the following imports in the same time:

<<< ./snippets/App.js.snippet:5[js]

Now, add the `app` class and add in the constructor a `message` property in the state (we'll use it to store the user input message) and a call to an `_initialize()` function: 

<<< ./snippets/App.js.snippet:6[js]

After that, create that function with the connection to Kuzzle:

<<< ./snippets/App.js.snippet:2[js]

Then we will [establish the connection](/core-classes/kuzzle/connect) to kuzzle and create, if they don't [exist](/controllers/index/exists), the [index](/controllers/index/create) and [collection](/controllers/collection/create) for our chat. 

Add the following lines to the `_initialize` function:

<<< ./snippets/App.js.snippet:3[js]

## Display the messages

We'll need some properties and functions to manage our messages.

We have to create our Redux store architecture (more details on [Redux documentation](https://redux.js.org/introduction/getting-started)), like this:


```bash
src
└── state
    ├── actions.js
    ├── reducers.js
    └── sagas.js
```


Add the following actions to the _src/state/actions.js_ file:

<<< ./snippets/actions.js.snippet[js]

Then we'll edit the _src/state/reducers.js_ file:

Add the `initialState`:

<<< ./snippets/reducers.js.snippet:1[js]

And the `reducersMap` with our `SET_MESSAGE` action:

<<< ./snippets/reducers.js.snippet:2[js]

Finally, export it: 

<<< ./snippets/reducers.js.snippet:3[js]

The entire file should look like this:

<<< ./snippets/reducers.js.snippet[js]

Now that our store is ready, we'll fetch the existing messages in Kuzzle and add them to our store.
Add the following lines to the `_initialize()` function of the `app` class in the _src/App.js_ file:

<<< ./snippets/App.js.snippet:7[js]

Then, add the following constants in the `render()` function of the `app` class:

<<< ./snippets/App.js.snippet:11[js]

And the loop in the return of the `render()` function to display the messages stored:

<<< ./snippets/App.js.snippet:13[html]


We can now display the messages stored in Kuzzle. In the next part, we'll see how to create new messages.

## Send messages

We need to write a simple method that will [create](/controllers/document/create) a new message document in Kuzzle.
Add the following function in your `app` class in the_src/App.js_ file:

<<< ./snippets/App.js.snippet:10[js]

Then, we need to create the `sendMessage()` Redux action we just called.
_src/state/sagas.js_ contains a generator function where we will put our sagas function. (more details on [Redux-saga documentation](https://redux-saga.js.org/)):

Let's add it in the _src/state/sagas.js_ file:

<<< ./snippets/sagas.js.snippet[js]

As you can see we don't push the new message in our state on message creation.
Now, we need to subscribe to changes made on the collection containing our messages.
So let's create our `_subscribeToNewMessages()` function in the `app` class in _src/App.js_ file. It will call Kuzzle's realtime controller to allow us to [receive notifications](/controllers/realtime/subscribe) on message creations:

<<< ./snippets/App.js.snippet:8[js]

Then, just add an input field bound to the `message` property, and a button calling our `sendMessage()` function:

<<< ./snippets/App.js.snippet:12[html]

We need to update our `message` state property when this input changes. To do that, the `onChange` event is bound to an `handleChange()` method.
Let's create in the `app` class:

<<< ./snippets/App.js.snippet:9[js]

To finish, just add the export to the _src/App.js_ file:

<<< ./snippets/App.js.snippet:15[js]

The entire file should look like this:

<<< ./snippets/App.js.snippet[js]

To launch this app, just type the following command:

```bash
yarn start
```

You can now add new messages to Kuzzle and receive the notification of the creation to update your state and display the new messages.

## Going further

Now that you're more familiar with Kuzzle with React, you can:

- discover what this SDK has to offer by browsing other sections of this documentation
- learn how to use [Koncorde](/core/2/guides/cookbooks/realtime-api/introduction) to create incredibly fine-grained and blazing-fast subscriptions
- learn more about Kuzzle [realtime engine](/core/2/guides/essentials/real-time)
- follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/2/guides/essentials/security)

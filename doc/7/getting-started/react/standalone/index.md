---
type: page
code: false
title: Standalone
description: Getting started with Kuzzle and ReactJS
order: 0
---

# Getting Started with Kuzzle and ReactJS

This section deals with **Kuzzle V2** (+ **Javascript SDK 7**) and **ReactJS**. We will create **documents** in Kuzzle and subscribe to
[document notifications](/sdk/js/7/essentials/realtime-notifications#document-messages) to develop a realtime chat.

## Requirements

- **Node.js** >= 12.0.0 ([install here](https://nodejs.org/en/download/))
- **Create React App** ([install here](https://github.com/facebook/create-react-app))
- **Running Kuzzle V2 Stack** ([instructions here](/core/2/guides/getting-started/running-kuzzle))

## Prepare your environment

Create your React app and install all the dependencies from the command line using npm:
```bash
npx create-react-app kuzzle-playground
```
Install Kuzzle's Javascript SDK: 
```bash
cd kuzzle-playground
npm install kuzzle-sdk@7
```

We'll rewrite the src/App.js so you can remove everything inside.

## Instantiating Kuzzle SDK

We have to connect the server so that our client can interact with it.
To do this, we have to create a *src/services/kuzzle.js* file to put our kuzzle instance declaration:

<<< ./snippets/kuzzle.js.snippet[js]

You can now edit the *src/App.js* file to connect to Kuzzle. To do this, import the kuzzle service file and the following imports in the same time:

<<< ./snippets/App.js.snippet:1[js]

Now, add the app class and add in the constructor a `message` property in the state (we'll use it to store the user input message) a `username` property, `messages` property (we’ll use it to store all messages) and a `validate` property (Value that will change the display):

<<< ./snippets/App.js.snippet:2[js]

Then we will establish the connection to kuzzle and create the index and collection of our chat if they don't exist. Add the following `valid()` method in the App Component:

<<< ./snippets/App.js.snippet:3[js]

## Get the username

First of all, we need to know the user's name. Let's start by adding the following function.

<<< ./snippets/App.js.snippet:4[js]

As you can see we'll need the `handleInputChange()` function to save the `username` variable

<<< ./snippets/App.js.snippet:5[js]

## Display the messages

Then, create the following functions to fetch and display the messages:

<<< ./snippets/App.js.snippet:6[js]

The function `fetchMessage()` will [search](/sdk/js/7/controllers/document/search) for the first hundred newest messages and store them in our array, before subscribing to changes in the messages collection. We called it in the `valid()` function we created above.

<<< ./snippets/App.js.snippet:7[js]

Now, add the following function outside the App component to display the messages:

<<< ./snippets/App.js.snippet:8[js]

## Send messages

We need to write a simple method that will [create](/sdk/js/7/controllers/document/create) a new message document in Kuzzle.

<<< ./snippets/App.js.snippet:9[js]

We will receive notifications from Kuzzle each time we modify our message collection (even if it is a message creation on our part) that we will use to add the messages in our array.
Now, we need to subscribe to the collection that contains our messages. So let's create our `subscribeMessages()` action. It will call Kuzzle's realtime controller to allow us to [receive notifications](/sdk/js/7/controllers/realtime/subscribe) on message creations:

<<< ./snippets/App.js.snippet:10[js]

Add an input field bound to the message property, and a button which calls our `sendMessage()` function: 

<<< ./snippets/App.js.snippet:11[js]

Add the following CSS classes:

<<< ./snippets/App.css.snippet[js]

To finish, add render of our App component:

<<< ./snippets/App.js.snippet:12[js]

The entire file should look like this:

<<< ./snippets/App.js.snippet[js]

To launch this app, just type the following command:

```bash
npm start
```

You can now add new messages to Kuzzle and receive the notification of the creation to update your state and display the new messages.

## go further ?

Now that you're more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- discover what this SDK has to offer by browsing other sections of this documentation
- learn more about Kuzzle [realtime engine](/core/2/guides/essentials/real-time)
- lean how to use Kuzzle [Admin Console](/core/2/guides/essentials/admin-console) to manage your users and data
- learn how to use [Koncorde](/core/2/guides/cookbooks/realtime-api/introduction) to create incredibly fine-grained and blazing-fast subscriptions
- follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/2/guides/essentials/security)


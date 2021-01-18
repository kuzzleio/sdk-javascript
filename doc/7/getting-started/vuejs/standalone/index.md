---
type: page
code: false
title: Standalone
description: Getting started with Kuzzle and VueJS
order: 0
---


# Getting Started with Kuzzle and VueJS

This section deals with **Kuzzle V2** (+ **Javascript SDK 7**) and **VueJS**. We will create **documents** in Kuzzle and subscribe to [document notifications](/sdk/js/7/essentials/realtime-notifications#document-messages) to develop a realtime chat.


## Requirements

- **Node.js** >= 8.0.0 ([install here](https://nodejs.org/en/download/))
- **Vue CLI** ([install here](https://cli.vuejs.org/guide/installation.html))
- **Running Kuzzle V2 Stack** ([instructions here](/core/2/guides/getting-started/run-kuzzle))

## Prepare your environment

Create your VueJS app with Vue CLI. You'll need to select manually the features,
just add Babel, Linter and select the default options for the other features. 
```bash
vue create kuzzle-playground
```

Install Kuzzle's Javascript SDK: 
```bash
cd kuzzle-playground
npm install kuzzle-sdk@7
```

In the _App.vue_ file, you should remove the tag, the import and the component registration of the `HelloWorld` component, we won't use it.

## Instantiating Kuzzle SDK

We have to connect the server so that our client can interact with it.

To do this, we have to create a _src/services/kuzzle.js_ file to put our kuzzle instance declaration:

<<< ./snippets/kuzzle.js.snippet[js]

We need to import our Kuzzle SDK instance, so just add the following line in your `<script>` tag in the _App.vue_ file: 

<<< ./snippets/App.vue.snippet:3[js]

Then we will [establish the connection](/sdk/js/7/core-classes/kuzzle/connect) to kuzzle and create, if they don't [exist](/sdk/js/7/controllers/index/exists/), the [index](/sdk/js/7/controllers/index/create) and [collection](/sdk/js/7/controllers/collection/create) of our chat. 
Add the following `valid()` method in the export of the `<script>` tag of your _App.vue_ file:

<<< ./snippets/App.vue.snippet:2[js]

## Get the username
First of all, we need to know the user's name. Let's start by adding the following HTML code in the `<template>` tag, allowing one to enter their name:

<<< ./snippets/App.vue.snippet:1[html]

As you can see we'll need two properties: `username` and `validate`.


## Display the messages

We'll need some properties to manage our messages. Add the following `data` to your _App.vue_

<<< ./snippets/App.vue.snippet:4[js]

Then, create the following functions to fetch and display the messages: 

<<< ./snippets/App.vue.snippet:5[js]

<<< ./snippets/App.vue.snippet:6[js]

The function `fetchMessage()` will [search](/sdk/js/7/controllers/document/search) for the first hundred newest messages and store them in our array, before subscribing to changes in the `messages` collection. We called it in the `valid()` function we created above.

<<< ./snippets/App.vue.snippet:7[js]

Now, add the following HTML code to display the messages:

<<< ./snippets/App.vue.snippet:8[html]

To finish this part, add the following CSS classes:

<<< ./snippets/App.vue.snippet:9[css]

We can now display the messages stored in Kuzzle. All there is to do is to create some.

## Send messages

We need to write a simple method that will [create](/sdk/js/7/controllers/document/create) a new message document in Kuzzle.

<<< ./snippets/App.vue.snippet:10[js]

As you can see we don't push the new message in our array on message creation.

Indeed, we will receive notifications from Kuzzle each time we modify our message collection (even if it is a message creation on our part) that we will use to add the messages in our array.

Now, we need to subscribe to the collection that contains our messages.
So let's create our `subscribeMessages()` action. It will call the Kuzzle's realtime controller to allow us to [receive notifications](/sdk/js/7/controllers/realtime/subscribe) on message creations:

<<< ./snippets/App.vue.snippet:11[js]

To finish, just add an input field bound to the `message` property, and a button which calls our `sendMessage()` function:

<<< ./snippets/App.vue.snippet:12[html]

And the following CSS class: 

<<< ./snippets/App.vue.snippet:13[css]

You can now add new messages to Kuzzle and receive the creation notification to update your state and display the new messages.

## Where do we go from here?

Now that you're more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- discover what this SDK has to offer by browsing other sections of this documentation
- learn more about Kuzzle [realtime engine](/core/2/guides/main-concepts/realtime-engine)
- follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/2/guides/main-concepts/permissions)
- lean how to use Kuzzle [Admin Console](http://next-console.kuzzle.io) to manage your users and data
- learn how to perform a [basic authentication](/sdk/js/7/controllers/auth/login)

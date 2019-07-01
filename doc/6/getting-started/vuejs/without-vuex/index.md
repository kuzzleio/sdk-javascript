---
type: page
code: false
title: Without Vuex
description: Getting started with Kuzzle and VueJS
order: 0
---


# Getting Started with Kuzzle and VueJS

This section deals with **Kuzzle** (+ **Javascript SDK**) and **VueJS**. We will create **documents** in Kuzzle and subscribe to [document notifications](/sdk/js/6/essentials/realtime-notifications/#document-messages) to develop a realtime chat.

You can find the full code of this guide [here](https://github.com/kuzzleio/sdk-javascript/tree/6-dev/doc/6/getting-started/vuejs/without-vuex).

## Requirements

- **Node.js** >= 8.0.0 ([install here](https://nodejs.org/en/download/))
- **Vue CLI** ([install here](https://cli.vuejs.org/guide/installation.html))
- **Running Kuzzle Stack** ([instructions here](/core/1/guides/getting-started/running-kuzzle/))

## Prepare your environment

Create your VueJS app with Vue CLI. You'll need to select manually the features,
just add Babel, Linter and select the default options for the other features. 
```bash
vue create kuzzle-playground
```

Install the kuzzle-sdk: 
```bash
cd kuzzle-playground
yarn add kuzzle-sdk
```

In the _App.vue_ file, you should remove the tag, the import and the component registration of the `HelloWorld` component, we won't use it.

## Instanciating Kuzzle SDK

We have to connect the server so that our client can interact with it.

To do this, we have to create _src/services/kuzzle.js_ file to put our kuzzle instance, a bit like a singleton:

<<< ./src/services/kuzzle.js

We need to import our Kuzzle SDK instance, so just add the following line in your `<script>` tag in the _App.vue_ file: 

<<< ./src/App.vue:3[js]

Then we will [etablish the connection](/sdk/js/6/core-classes/kuzzle/connect/) to kuzzle and create, if they don't [exists](sdk/js/6/controllers/index/exists/), the [index](sdk/js/6/controllers/index/create/) and [collection](sdk/js/6/controllers/collection/create/) of our chat. 
Add the following `valid()` method in the export of the `<script>` tag of your _App.vue_ file:

<<< ./src/App.vue:2[js]

## Get the username
First of all, we need to know the user nickname. Let's start by adding the following html code in the `<template>` tag to allow the client type his nickname:

<<< ./src/App.vue:1[html]

As you can see we'll need two properties: `username` and `validate`.


## Display the messages

We'll need some properties to manage our messages. Add the following `data` to your _App.vue_

<<< ./src/App.vue:4[js]

Then, create the following functions to fetch and display the messages: 

<<< ./src/App.vue:5[js]

<<< ./src/App.vue:6[js]

The function `fetch_message()` will [search](/sdk/js/6/controllers/document/search/) for the first hundred newest messages and store them in our array before subscribe to notification about `messages` collection. We called it in the `valid()` function we created before.

<<< ./src/App.vue:7[js]

Now, just add the following html code to display the messages:

<<< ./src/App.vue:8[html]

To finish this part, just add the following css classes:

<<< ./src/App.vue:9[css]

We can now display the messages stored in Kuzzle. Cool but we need to create some right ?

## Send messages

We need to write a simple method that will [create](/sdk/js/6/controllers/document/create/) a new message document in Kuzzle.

<<< ./src/App.vue:10[js]

As you can see we don't push the new message in our array on message creation.
Actually, We'll subscribe to the collection that contains our messages.
So let's create our `subscribe_messages()` action. It will call the realtime controller of Kuzzle to allow us to [receive notifications](/sdk/js/6/controllers/realtime/subscribe/) on message creation:

<<< ./src/App.vue:11[js]

To finish, just add an input field, bond to the `message` property and a button which calls our `sendMessage()` function:

<<< ./src/App.vue:12[html]

And the following CSS class: 

<<< ./src/App.vue:13[css]

You can now add new messages to Kuzzle and receive the notification of the creation to update your state and display the new messages, enjoy :)

You can find the full code of this guide [here](https://github.com/kuzzleio/sdk-javascript/tree/6-dev/doc/6/getting-started/vuejs/without-vuex).

## Where do we go from here?

Now that you're more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- discover what this SDK has to offer by browsing other sections of this documentation
- learn more about Kuzzle [realtime engine](/core/1/guides/essentials/real-time/)
- follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/1/guides/essentials/security/)
- lean how to use Kuzzle [Admin Console](/core/1/guides/essentials/admin-console/) to manage your users and data
- learn how to perform a [basic authentication](/sdk/js/6/controllers/auth/login)

---
type: page
code: false
title: React Native
description: Getting started with Kuzzle and React Native using Expo
order: 400
---


# Getting Started with Kuzzle and React Native

This section deals with **Kuzzle** (+ **Javascript SDK**) and **React Native**. We will create **documents** in Kuzzle and subscribe to [document notifications](/sdk/js/7/essentials/realtime-notifications/#document-messages) to develop a realtime chat.


## Requirements

- **Node.js** >= 8.0.0 ([install here](https://nodejs.org/en/download/))
- **Expo CLI** ([install here](https://docs.expo.io/versions/v36.0.0/get-started/installation/))
- **Running Kuzzle Stack** ([instructions here](/core/2/guides/getting-started/running-kuzzle/))

## Prepare your environment

Create your React Native app with Expo CLI.
```bash
expo init getting-started-kuzzle
```
You can use yarn to install dependancies if you want.
Then choose a blank project, type 'Kuzzle' and type y.

Install Kuzzle's Javascript SDK: 
```bash
cd getting-started-kuzzle
npm install kuzzle-sdk
```

Now, you can run your app and access if by different way:

  - To test it on your smartphone, you'll need to download the 
  expo application and scan the displayed qrCode after running this command:
  ```bash
  expo start
  ```
  - To test it in your browser, you can run the following command:
  ```bash
  expo start --web
  ```

## Get the username
First of all, we need to know the user's name.
Let's start by creating the following file _screens/Login/Login.js_ and add some imports.

<<< ./snippets/Login.js.snippet:1[js]

Then we must to export our `Login` class with the render function:

<<< ./snippets/Login.js.snippet:2[js]

As you can see, this component has no state. It'll send the typed username
to his parent composent by a `onSubmitName` method passed as props.

To finish, we can add some style properties to let our login page looks better.

<<< ./snippets/Login.js.snippet:3[js]

This parent component of _Login.js_ will be _App.js_ so let's work on it. 

You can delete all the code from the _App.js_ file, we will rewrite it.

First, add the following imports:

<<< ./snippets/App.js.snippet:1[js]

Then we need to do three changes:
  - In first, we must export our *App* class:
    <<< ./snippets/App.js.snippet:2[js]
  - In second, we need to create our `onSubmitName` function:
    <<< ./snippets/App.js.snippet:3[js]
  - To finish, we will create our render function:
    <<< ./snippets/App.js.snippet:4[js]

You can see that we will have to create a new component, *ChatClient*.
That new component will contain the link to our kuzzle backend so we need first declare our kuzzle service.


## Instantiating Kuzzle SDK and Adding logical part

We have to connect the server so that our client can interact with it.

To do this, we have to create a _/services/kuzzle.js_ file to put our kuzzle instance declaration:

<<< ./snippets/kuzzle.js.snippet[js]

Note that if you are running your application on your smartphone, you must be connected on the same network and you'll need to change the `localhost` in the previous snippet by your computer ip address.

We can now create a _screens/Chat/ChatClient.js_ file to use our kuzzle service.

Like in our previous components, we'll first need to add our imports:

<<< ./snippets/ChatClient.js.snippet:1[js]

Then we will create our state that will contains our messages and call the function that will initialize our kuzzle by [establish the connection](/sdk/js/7/core-classes/kuzzle/connect/) to kuzzle and create, if they don't [exist](sdk/js/6/controllers/index/exists/), the [index](sdk/js/6/controllers/index/create/) and [collection](sdk/js/6/controllers/collection/create/) of our chat. 

<<< ./snippets/ChatClient.js.snippet:2[js]

You can see that we are calling two functions at the end: 
`fetchMessages()` and `subscribeMessages()`, let's write them.

Create the following function to fetch the messages: 

<<< ./snippets/ChatClient.js.snippet:6[js]

The function `fetchMessage()` will [search](/sdk/js/7/controllers/document/search/) for the first hundred newest messages and store them in our state, before subscribing to changes in the `messages` collection.

Then, create the `subscribeMessages()` function.
It will call the Kuzzle's realtime controller to allow us to [receive notifications](/sdk/js/7/controllers/realtime/subscribe/) on message creations:

<<< ./snippets/ChatClient.js.snippet:7[js]

You can see in the two function we just wrote a call to a `getMessage()` function when we are adding a new message to the state. This function will format our kuzzle's notification/response.

<<< ./snippets/ChatClient.js.snippet:5[js]

Note: The first part of this function is optionnal and can be replace by a set of the `display` variable to false. 

If you decided to add the optionnal part, you'll need to implement the `displayDate()` function:

<<< ./snippets/ChatClient.js.snippet:4[js]

In the constructor of this component, we setted a `handleSendMessage` property to a binded `onSendMessage` function. Let's implement that function:

<<< ./snippets/ChatClient.js.snippet:8[js]

This simple method will [create](/sdk/js/7/controllers/document/create/) a new message document in Kuzzle. 

As you can see we don't push the new message in our array on message creation.

Indeed, we will receive notifications from Kuzzle each time we modify our message collection (even if it is a message creation on our part) that we will use to add the messages in our array.

Since this component is used to do the connection to Kuzzle, it will render another one that will display the messages _screens/Chat/ChatView.js_. 
To finish, we just need to add the `render()` function: 

<<< ./snippets/ChatClient.js.snippet:9[js]

As you can see, we are passing as props the fetched messages, the client username and the handleSendMessage function.

## Display and Send messages

In this part we'll work on another component, so we need to create the _screens/Chat/ChatView.js_ file. 

Then, just add the following imports:

<<< ./snippets/ChatView.js.snippet:1[js]

Now we need to create ou `ChatView` class and bind a `handleSendMessage` property to an `onSendMessage` function that will call the props parent function. 

<<< ./snippets/ChatView.js.snippet:2[js]

There is no logic in this component so let's work on the render function:

<<< ./snippets/ChatView.js.snippet:5[js]

In the previous snippet, you can see that we are using a Flatlist to display the messages passed as props from the `ChatClient` component.
The first view part in the Flatlist to the previous optionnal part. It is used to display the date only once for each message sended at the same date.

Then just add the TextInput part with a call to our `handleSendMessage` property:

<<< ./snippets/ChatView.js.snippet:6[js]

And don't forget to close the opened tags:

<<< ./snippets/ChatView.js.snippet:7[js]

To finish, just add the style part to make it beautiful:

<<< ./snippets/ChatView.js.snippet:8[js]

You can now add new messages to Kuzzle and receive the creation notification to update your state and display the new messages.

## Where do we go from here?

Now that you're more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- discover what this SDK has to offer by browsing other sections of this documentation
- learn more about Kuzzle [realtime engine](/core/2/guides/essentials/real-time/)
- follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/2/guides/essentials/security/)
- lean how to use Kuzzle [Admin Console](/core/2/guides/essentials/admin-console/) to manage your users and data
- learn how to perform a [basic authentication](/sdk/js/7/controllers/auth/login)

<template>
  <div id="app">
    <!-- snippet:start:1 -->
    <div v-if="!validate">
      <input
        autofocus
        v-on:keyup.enter="valid"
        type="text"
        v-model="username"
        placeholder="Enter your nickname"
      />
      <button @click="valid">Valid</button>
    </div>
    <!-- snippet:end -->
    <!-- snippet:start:12 -->
    <div class="wrapper" v-else>
      <input
        autofocus
        type="text"
        v-model="message"
        v-on:keyup.enter="sendMessage"
        placeholder="Enter your message"
      />
      <button @click="sendMessage">Send</button>
    </div>
    <!-- snippet:end -->
    <!-- snippet:start:8 -->
    <div
      v-for="message in messages"
      :key="message._id"
      :class="`messages ${message.username === username ? 'fromMe' : 'fromOthers'}`"
    >
      <span class="username">{{ message.username }}</span>
      <span>({{ getDate(message.createdAt) }})</span>
      <p>{{ message.value }}</p>
    </div>
    <!-- snippet:end -->
  </div>
</template>

<script>
/* snippet:start:3 */
import kuzzle from "./services/kuzzle";
/* snippet:end */

export default {
  name: "app",
  /* snippet:start:4 */
  data() {
    return {
      message: "", // String containing the user input
      messages: [], // Array containing our messages
      roomID: "", // Id of the realtime subscription
      username: "", // Nickname of the current user
      validate: false // Value that will change the display (false => Pseudo input; true => Message input)
    };
  },
  /* snippet:end */
  methods: {
    /* snippet:start:5 */
    // This function return the right formated date depending on the timestamp
    getDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString().split("GMT")[0];
    },
    /* snippet:end */
    /* snippet:start:6 */
    // This function will create a message object containing the informations we need to display it
    getMessage(document) {
      const message = {
        // The unique id of the document containing the message
        _id: document._id,
        // The text of the message
        value: document._source.value,
        // The creation date
        createdAt: document._source._kuzzle_info.createdAt,
        // The author name
        username: document._source.username
      };
      return message;
    },
    /* snippet:end */
    /* snippet:start:10 */
    async sendMessage() {
      if (this.message === "") return;
      // Call the create method of the document controller
      await kuzzle.document.create(
        "chat",
        "messages",
        // Give as parameter the object that will be store in kuzzle
        {
          value: this.message,
          username: this.username
        }
      );
      // Clear the user input
      this.message = "";
    },
    /* snippet:end */
    /* snippet:start:11 */
    async subscribe_messages() {
      // Call the subscribe method of the realtime controller and receive the roomId
      // Save the id of our subscription (we could need it to unsubscribe)
      this.roomID = await kuzzle.realtime.subscribe(
        "chat", // Id of the index
        "messages", // Id of the collection
        {}, // Filter
        // Callback for notifications receive
        notification => {
          // Check if the notification interest us (only document creation)
          if (notification.type !== "document") return;
          if (notification.action !== "create") return;
          // Add the new message to our array
          this.messages = [
            this.getMessage(notification.result),
            ...this.messages
          ];
        }
      );
    },
    /* snippet:end */
    /* snippet:start:7 */
    async fetch_messages() {
      // Call the search method of the document controller
      const results = await kuzzle.document.search(
        "chat", // Name of the index
        "messages", // Name of the collection
        { sort: ["_kuzzle_info.createdAt"] }, // Query => Sort the messages by creation date
        { size: 100 } // Options => get a maximum of 100 messages
      );
      // Add each message to our array
      results.hits.map(hit => {
        this.messages = [this.getMessage(hit), ...this.messages];
      });
    },
    /* snippet:end */
    /* snippet:start:2 */
    async valid() {
      // Etablish the connection
      await kuzzle.connect();
      // Check if 'chat' index exists
      if (!(await kuzzle.index.exists("chat"))) {
        // If not, create 'chat' index and 'messages' collection
        await kuzzle.index.create("chat");
        await kuzzle.collection.create("chat", "messages");
      }
      await this.fetch_messages();
      await this.subscribe_messages();
      this.validate = true;
    }
    /* snippet:end */
  }
};
</script>

<style>
/* snippet:start:9 */
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.username {
  font-weight: bold;
}

.messages {
  padding: 10px;
  margin: 1px;
  width: 45vw;
  border-radius: 10px;
}

.fromMe {
  text-align: right;
  float: right;
  margin-left: 49vw;
  background-color: #9ca4f0;
}

.fromOthers {
  text-align: left;
  margin-right: 49vw;
  float: left;
  background-color: rgb(206, 246, 147);
}
/* snippet:end */

/* snippet:start:13 */
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
/* snippet:end */
</style>

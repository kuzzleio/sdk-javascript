/* snippet:start:1 */
import React from "react";
import ChatView from "./ChatView";
import kuzzle from "../../services/kuzzle";
/* snippet:end */

/* snippet:start:2 */
class ChatClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
    this.kuzzle = kuzzle;
    this.handleSendMessage = this.handleSendMessage.bind(this);
  }

  async componentDidMount() {
    await this.initConnection();
    await this.fetchMessages();
    await this.subscribeMessages();
  }

  async initConnection() {
    // Etablish the connection
    await kuzzle.connect();
    // Check if 'chat' index exists
    if (!(await kuzzle.index.exists("chat"))) {
      // If not, create 'chat' index and 'messages' collection
      await kuzzle.index.create("chat");
      await kuzzle.collection.create("chat", "messages");
    }
  }
  /* snippet:end */

  /* snippet:start:4 */
  displayDate(previousDate, currentDate) {
    if (previousDate === null) {
      // Message is the first of the array so we need to display the date
      return true;
    }
    const d1 = new Date(previousDate).toDateString();
    const d2 = new Date(currentDate).toDateString();
    if (d1 !== d2) {
      // Previous message and current has different dates so we need to display the date
      return true;
    }
    // Previous message and current has same dates so we doesn't need to display the date
    return false;
  }
  /* snippet:end */

  /* snippet:start:5 */
  getMessage(msg, displayDate) {
    const message = {
      // The unique id of the document containing the message
      id: msg._id,
      // The text of the message
      message: msg._source.message,
      // The creation date
      date: msg._source._kuzzle_info.createdAt,
      // The author name
      author: msg._source.author,
      // Boolean to display or not the date
      displayDate
    };
    // displayDate will be set to true only if the previous message is from 
    // another day in goal to display only one time the dates and only the 
    // hours on each messages
    return message;
  }
  /* snippet:end */

  /* snippet:start:6 */
  async fetchMessages() {
    // Call the search method of the document controller
    const results = await this.kuzzle.document.search(
      "chat", // Name of the index
      "messages", // Name of the collection
      { sort: { "_kuzzle_info.createdAt": { order: "asc" } } }, // Query => Sort the messages by creation date
      { size: 100 } // Options => get a maximum of 100 messages
    );
    // Add messages to our array after formating them
    await this.setState({
      messages: results.hits.map((msg, msgIdx, arrayOfMsg) => {
        let displayDate;
        if (msgIdx === 0) {
          // We always display the date for the first fetched message
          displayDate = true;
        } else {
          // Check if the message is in the same day of the previous
          displayDate = this.displayDate(
            arrayOfMsg[msgIdx - 1]._source._kuzzle_info.createdAt,
            msg._source._kuzzle_info.createdAt
          );
        }
        return this.getMessage(msg, displayDate);
      })
    });
  }
  /* snippet:end */

  /* snippet:start:7 */
  async subscribeMessages() {
    // Call the subscribe method of the realtime controller and receive the roomId
    const roomId = await this.kuzzle.realtime.subscribe(
      "chat", // Id of the index
      "messages", // Id of the collection
      {}, // Filter
      // Callback to receive notifications
      async notification => {
        // Check if the notification interest us (only document creation)
        if (notification.type !== "document") return;
        if (notification.action !== "create") return;
        const length = this.state.messages.length;
        let displayDate;
        if (length === 0) {
          // If we haven't fetched some messages we must display the date for the first message we receive
          displayDate = true;
        } else {
          // Check if the message is in the same day of the last message
          displayDate = this.displayDate(
            this.state.messages[length - 1].date,
            notification.result._source._kuzzle_info.createdAt
          );
        }
        // Add the new message to our array
        await this.setState({
          messages: [
            ...this.state.messages.slice(),
            this.getMessage(notification.result, displayDate)
          ]
        });
      }
    );
    // Save the id of our subscription (we could need it to unsubscribe)
    this.setState({ roomId: roomId });
  }
  /* snippet:end */

  /* snippet:start:8 */
  async handleSendMessage(message) {
    await kuzzle.document.create(
      "chat",
      "messages",
      // The document to be stored is passed in parameter
      {
        author: this.props.name,
        message
      }
    );
  }
  /* snippet:end */

  /* snippet:start:9 */
  render() {
    const messages = this.state.messages;
    return (
      <ChatView
        messages={messages}
        onHandleSendMessage={this.handleSendMessage}
        name={this.props.name}
      />
    );
  }
}
export default ChatClient;
/* snippet:end */

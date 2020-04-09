/* snippet:start:1 */
import React from 'react';
import kuzzle from "./services/kuzzle";
import './App.css';
/* snippet:end */
/* snippet:start:8 */
const Message = function (props) {
  const { message, username } = props;
  return (
    <div className={(message.username === username ? 'fromMe' : 'fromOthers') + ' messages'}>
      <span> User: <b>{message.username}</b>  (</span>
      <span> {new Date(message.createdAt).toLocaleString().split("GMT")[0]} )</span>
      <p> {message.value} </p>
    </div>
  );
}
/* snippet:end */
/* snippet:start:2 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      message: "",
      messages: [],
      validate: false,
    };
  }
  /* snippet:end */
  /* snippet:start:3 */
  valid = async () => {
    await kuzzle.connect();
    if (!await kuzzle.index.exists("chat")) {
      await kuzzle.index.create("chat");
      await kuzzle.collection.create("chat", "messages");
    }
    await this.subscribeMessages();
    await this.fetchMessages();
    this.setState({ validate: true });
  }
  /* snippet:end */
  /* snippet:start:10 */
  subscribeMessages = () => {
    return (
      kuzzle.realtime.subscribe(
        "chat",
        "messages", {},
        notification => {
          if (notification.type !== "document") return;
          if (notification.action !== "create") return;
          this.setState({
            messages: [
              this.getMessage(notification.result),
              ...this.state.messages
            ]
          })
        }
      )
    );
  }
  /* snippet:end */
  /* snippet:start:6 */
  getMessage = document => {
    const message = {
      _id: document._id,
      value: document._source.value,
      createdAt: document._source._kuzzle_info.createdAt,
      username: document._source.username
    };
    return message;
  }
  /* snippet:end */
  /* snippet:start:7 */
  fetchMessages = async () => {
    const results = await kuzzle.document.search(
      "chat",
      "messages",
      {
        sort: ["_kuzzle_info.createdAt"]
      },
      {
        size: 100
      }
    );
    results.hits.map(hit => {
      this.setState({ messages: [this.getMessage(hit), ...this.state.messages] })
    });
  }
  /* snippet:end */
  /* snippet:start:5 */
  handleInputChange = event => {
    const value = event.target.value;
    const name = event.target.name;
    this.setState({
      [name]: value
    });
  }
  /* snippet:end */

  /* snippet:start:4 */
  renderUsernameInput = () => {
    if (this.state.validate === false)
      return (
        <div className="wrapper">
          <input autoFocus name="username" id="username"
            onKeyUp={this.handleInputChange}
            type="text"
            placeholder="Enter your nickname"
          />
          <button onClick={this.valid}>Valid</button>
        </div>
      );
  }
  /* snippet:end */
  /* snippet:start:9 */
  sendMessage = async () => {
    if (this.state.message === "") return;
    await kuzzle.document.create(
      "chat",
      "messages",
      {
        value: this.state.message,
        username: this.state.username
      }
    );
    this.setState({ message: "" })
  }
  /* snippet:end */
  /* snippet:start:11 */
  renderMessageInput = () => {
    if (this.state.validate === true)
      return (
        <div className="wrapper">
          <input autoFocus type="text"
            id="message"
            name="message"
            onChange={this.handleInputChange}
            placeholder="Enter your message"
            value={this.state.message}
          />
          <button onClick={() => this.sendMessage()}>Send</button>
        </div>
      );
  }
  /* snippet:end */
  /* snippet:start:12 */
  render() {
    return (
      <div>
        {this.renderUsernameInput()}
        {this.renderMessageInput()}
        <div>
          {this.state.messages.map((message, idx) => {
            return (<Message key={idx} message={message} username={this.state.username} />)
          })}
        </div>
      </div>
    );
  }
  /* snippet:end */
}

export default App;
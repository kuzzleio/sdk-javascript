/* snippet:start:5 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css';
import ActionCreators from './state/actions';
/* snippet:end */

/* snippet:start:1 */
import kuzzle from './services/kuzzle';
/* snippet:end */

/* snippet:start:6 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ''
    };
    this._initialize();
  }
/* snippet:end */

  /* snippet:start:2 */
  async _initialize() {
    // handler to be notified in case of a connection error
    kuzzle.on('networkError', error => {
      console.error(error.message);
    });
    
    await kuzzle.connect();
    /* snippet:end */

    /* snippet:start:3 */
    const exists = await kuzzle.index.exists('chat');
    if (!exists) {
      await kuzzle.index.create('chat');
      await kuzzle.collection.create('chat', 'messages');
    }
    /* snippet:end */

    /* snippet:start:7 */
    const results = await kuzzle.document.search(
      'chat',
      'messages',
      {} // leave body empty to match all documents
    );
    
    if (results.total > 0) {
      this.props.setMessages(results.hits.map(hit => hit._source));
    }

    this._subscribeToNewMessages();
    /* snippet:end */
  }
  
  /* snippet:start:8 */
  async _subscribeToNewMessages() {
    kuzzle.realtime.subscribe('chat', 'messages', {}, notif => {
      if (!(notif.type === 'document' && notif.action === 'create')) {
        return;
      }
      const { _source: message } = notif.result;
      this.props.setMessages([message]);
    });
  }
  /* snippet:end */

  /* snippet:start:9 */
  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };
  /* snippet:end */

  /* snippet:start:10 */
  sendMessage = event => {
    this.props.sendMessage(this.state.message);
    this.setState({
      message: ''
    });
  };
  /* snippet:end */

  /* snippet:start:11 */
  render() {
    const { messages } = this.props;
    const { message } = this.state;
  /* snippet:end */

    return (
      <div>
        {/* snippet:start:12  */}
        <div>
          <input
            type="text"
            name="message"
            id="message"
            value={message}
            onChange={this.handleChange}
          />
          <button onClick={this.sendMessage}>Envoyer</button>
        </div>
        {/* snippet:end  */}
        {/* snippet:start:13  */}
        <div>
          {[...messages].reverse().map((message, index) => (
            <p key={index}>{message.text}</p>
          ))}
        </div>
        {/* snippet:end  */}
      </div>
    );
  }
}

/* snippet:start:15 */
// connect to redux store
export default connect(
  state => ({
    messages: state.messages
  }),
  {
    sendMessage: ActionCreators.sendMessage,
    setMessages: ActionCreators.setMessages
  }
)(App);
/* snippet:end */

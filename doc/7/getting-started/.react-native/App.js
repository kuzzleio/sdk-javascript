/* snippet:start:1 */
import React from 'react';
import Login from './screens/Login/Login';
import ChatClient from './screens/Chat/ChatClient';
/* snippet:end */

/* snippet:start:2 */
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitName = this.onSubmitName.bind(this);
    this.state = {
      hasName: false
    };
  }
  /* snippet:end */
  /* snippet:start:3 */
  onSubmitName(e) {
    const name = e.nativeEvent.text;
    this.setState({
      name,
      hasName: true
    });
  }
  /* snippet:end */
  /* snippet:start:4 */
  render() {
    if (this.state.hasName) {
      return (
        <ChatClient name={this.state.name} />
      );
    } else {
      return (
        <Login onSubmitName={this.handleSubmitName} />
      );
    }
  }
}
/* snippet:end */
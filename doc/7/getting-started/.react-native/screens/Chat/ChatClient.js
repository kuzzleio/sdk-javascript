import React from 'react';
import ChatView from './ChatView';
import kuzzle from '../../services/kuzzle';

class ChatClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
        this.kuzzle = kuzzle;
        this.handleSendMessage = this.onSendMessage.bind(this);
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
        if (! await kuzzle.index.exists("chat")) {
            // If not, create 'chat' index and 'messages' collection
            await kuzzle.index.create("chat");
            await kuzzle.collection.create("chat", "messages");
        }
    }
    displayDate(previousDate, currentDate) { 
        if (previousDate === null) {// Message is the first of the array so need to display the date
            return true;
        }
        const d1 = new Date(previousDate).toDateString()
        const d2 = new Date(currentDate).toDateString()
        if (d1 !== d2) {
             // Previous message and current has different dates so need to display the date
             return true
        };
        // Previous message and current has same dates so doesn't need to display the date
        return false;
    }
    getMessage(hit, idx, array) {
        // display will be set to true only if the previous message is from another day in goal to display only one time the dates
        // and only the hours on each messages
        let display = null;
        // Not idx and array provided -> call from subscribe
        let length = this.state.messages.length;
        if (length == 0) {
            display = false;
        } else if (idx === null || array === null) {
            display = this.displayDate( this.state.messages[length - 1].date, hit._source._kuzzle_info.createdAt)
        } else { // idx and array provided -> call from fetch 
            display = idx === 0 ? true : this.displayDate(array[idx - 1]._source._kuzzle_info.createdAt , hit._source._kuzzle_info.createdAt);
        }
        const message = {
            // The unique id of the document containing the message
            id: hit._id,
            // The text of the message
            message: hit._source.message,
            // The creation date
            date: hit._source._kuzzle_info.createdAt,
            // The author name
            author: hit._source.author,
            // Boolean to display or not the date
            displayDate: display
        };
        return message;
    }
    async fetchMessages() {
        // Call the search method of the document controller
        const results = await this.kuzzle.document.search(
            "chat", // Name of the index
            "messages", // Name of the collection
            { sort: { "_kuzzle_info.createdAt": { order: "desc" } } }, // Query => Sort the messages by creation date
            { size: 100 } // Options => get a maximum of 100 messages
        );
        // Add messages to our array after formating them
        await this.setState({
            messages: results.hits.reverse().map((hit, idx, array) => this.getMessage(hit, idx, array))
        });
    }

    async subscribeMessages() {
        // Call the subscribe method of the realtime controller and receive the roomId
        const roomId = await this.kuzzle.realtime.subscribe(
            "chat", // Id of the index
            "messages", // Id of the collection
            {}, // Filter
            // Callback to receive notifications
            notification => {
                // Check if the notification interest us (only document creation)
                if (notification.type !== "document") return;
                if (notification.action !== "create") return;
                // Add the new message to our array
                this.setState({
                    messages: [...this.state.messages.slice(), this.getMessage(notification.result, null, null)]
                });
            }
        );
        // Save the id of our subscription (we could need it to unsubscribe)
        this.setState({ roomId: roomId });
    }

    async onSendMessage(text) {
        await kuzzle.document.create(
            "chat",
            "messages",
            // Pass the document to be stored in Kuzzle as a parameter
            {
                author: this.props.name,
                message: text
            }
        );
    }

    render() {
        const messages = this.state.messages;
        return (
            <ChatView messages={messages} onSendMessage={this.handleSendMessage} name={this.props.name} />
        );
    }
}
export default ChatClient;

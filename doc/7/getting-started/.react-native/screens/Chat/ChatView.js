import React from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Text,
    FlatList,
    SafeAreaView,
    KeyboardAvoidingView
} from 'react-native';

class ChatView extends React.Component {
    constructor(props) {
        super(props);
        this.handleSendMessage = this.onSendMessage.bind(this);
        this.state = {
        }
    }

    onSendMessage = e => {
        this.props.onSendMessage(e.nativeEvent.text);
        this.refs.input.clear();
    }
    getDate(timestamp) {
        const date = new Date(timestamp);
        return date.toTimeString().split('GMT')[0]
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView style={styles.container} behavior="padding">
                    <FlatList
                        style={styles.list}
                        data={this.props.messages}
                        ref={ref => this.flatList = ref}
                        onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})}
                        renderItem={({ item }) =>
                            <View>
                                <View>
                                    {
                                        item.displayDate ? 
                                        <Text style={styles.date}>{new Date(item.date).toDateString()}</Text> : 
                                       null
                                    }
                                </View>
                                <View
                                    testID={this.props.name === item.author ? 'fromMe' : 'fromOthers'}
                                    style={this.props.name === item.author ? styles.currentUser : styles.others}
                                >
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 5
                                    }}>
                                        <Text style={styles.name}>{item.author}</Text>
                                        <Text style={styles.date}>{this.getDate(item.date)}</Text>
                                    </View>
                                    <Text style={styles.message}>{item.message}</Text>
                                </View>
                            </View>
                        }
                        keyExtractor={item => item.id}
                    />
                    <TextInput
                        style={styles.inputMessage}
                        placeholder='Send message...'
                        onSubmitEditing={this.handleSendMessage}
                        keyboardType="default"
                        returnKeyType="done"
                        enablesReturnKeyAutomatically
                        blurOnSubmit={false}
                        ref="input"
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}
let lastDate = null;

const offset = 24;
const styles = StyleSheet.create({
    name: {
        fontWeight: "bold"
    },
    date: {
        textAlign: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    list: {
        marginTop: 30,
        marginBottom: 30,
        alignSelf: 'stretch',
    },
    currentUser: {
        backgroundColor: '#85EA41',
        alignSelf: 'flex-end',
        margin: 5,
        width: 200,
        padding: 5,
        borderRadius: 5,
    },
    others: {
        backgroundColor: '#1478FC',
        alignSelf: 'flex-start',
        margin: 5,
        width: 200,
        padding: 5,
        borderRadius: 5
    },
    inputMessage: {
        alignSelf: 'stretch',
        borderColor: '#111111',
        borderWidth: 1,
        borderRadius: 15,
        borderColor: 'grey',
        margin: 5,
        paddingHorizontal: offset,
    }
});
export default ChatView;
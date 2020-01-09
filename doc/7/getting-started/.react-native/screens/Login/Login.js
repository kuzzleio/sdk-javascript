/* snippet:start:1 */
import React from 'react';
import { StyleSheet, Text, TextInput, KeyboardAvoidingView } from 'react-native';
/* snippet:end */
/* snippet:start:2 */
export default class Login extends React.Component {
    render() {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <Text>Type your username:</Text>
                <TextInput autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    keyboardType="default"
                    maxLength={20}
                    placeholder="Username"
                    returnKeyType="done"
                    enablesReturnKeyAutomatically
                    style={styles.username}
                    onSubmitEditing={this.props.onSubmitName}
                />
            </KeyboardAvoidingView>
        );
    }
}
/* snippet:end */
/* snippet:start:3 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    username: {
        alignSelf: 'stretch',
        textAlign: 'center'
    }
});
/* snippet:end */

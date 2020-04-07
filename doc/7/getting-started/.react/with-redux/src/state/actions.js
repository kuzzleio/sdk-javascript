const ActionCreators = {
    sendMessage: text => ({
      type: 'SEND_MESSAGE',
      payload: {
        text
      }
    }),
    setMessages: messages => ({
        type: 'SET_MESSAGES',
        payload: {
          messages
        }
      })
  };
  
export default ActionCreators;
import { takeEvery } from 'redux-saga/effects';
import kuzzle from '../services/kuzzle';

const sendMessage = function*({ payload: { text } }) {
  try {
    const document = {
      text
    };
    yield kuzzle.document.create('chat', 'messages', document);
  } catch (e) {
    console.error(e);
  }
};

export default function*() {
  yield takeEvery('SEND_MESSAGE', sendMessage);
}
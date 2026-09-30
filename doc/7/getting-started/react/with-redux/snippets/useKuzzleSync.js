import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import kuzzle from "./services/kuzzle";
import {
  fetchMessages,
  messageReceived,
  toMessage,
} from "./state/messagesSlice";

export function useKuzzleSync(username) {
  const dispatch = useDispatch();
  const roomId = useRef(null);

  useEffect(() => {
    // Nothing to do until the user has picked a nickname
    if (!username) {
      return;
    }

    const start = async () => {
      await kuzzle.connect();

      // Creates the index and the collection on first run
      if (!(await kuzzle.index.exists("chat"))) {
        await kuzzle.index.create("chat");
        await kuzzle.collection.create("chat", "messages");
      }

      // Every new message is pushed into the store by the reducer
      roomId.current = await kuzzle.realtime.subscribe(
        "chat",
        "messages",
        {},
        (notification) => {
          if (notification.type !== "document") {
            return;
          }

          if (notification.action !== "create") {
            return;
          }

          dispatch(messageReceived(toMessage(notification.result)));
        },
      );

      dispatch(fetchMessages());
    };

    start().catch((error) => console.error(error.message));

    return () => {
      if (roomId.current) {
        kuzzle.realtime.unsubscribe(roomId.current);
        roomId.current = null;
      }
    };
  }, [dispatch, username]);
}

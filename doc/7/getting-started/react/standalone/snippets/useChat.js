import { useCallback, useEffect, useRef, useState } from "react";

import kuzzle from "./services/kuzzle";

// Turns a Kuzzle document into the shape our components expect
const toMessage = (document) => ({
  _id: document._id,
  value: document._source.value,
  username: document._source.username,
  createdAt: document._source._kuzzle_info.createdAt,
});

export function useChat(username) {
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const roomId = useRef(null);

  useEffect(() => {
    // Nothing to do until the user has picked a nickname
    if (!username) {
      return;
    }

    let cancelled = false;

    const start = async () => {
      await kuzzle.connect();

      // Creates the index and the collection on first run
      if (!(await kuzzle.index.exists("chat"))) {
        await kuzzle.index.create("chat");
        await kuzzle.collection.create("chat", "messages");
      }

      // Receives a notification for every new message
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

          setMessages((previous) => [
            toMessage(notification.result),
            ...previous,
          ]);
        },
      );

      // Loads the hundred most recent messages
      const results = await kuzzle.document.search(
        "chat",
        "messages",
        { sort: { "_kuzzle_info.createdAt": "desc" } },
        { size: 100 },
      );

      if (cancelled) {
        return;
      }

      setMessages(results.hits.map(toMessage));
      setReady(true);
    };

    start().catch((error) => console.error(error.message));

    return () => {
      cancelled = true;

      if (roomId.current) {
        kuzzle.realtime.unsubscribe(roomId.current);
        roomId.current = null;
      }
    };
  }, [username]);

  const sendMessage = useCallback(
    async (value) => {
      if (!value) {
        return;
      }

      await kuzzle.document.create("chat", "messages", { value, username });
    },
    [username],
  );

  return { messages, ready, sendMessage };
}

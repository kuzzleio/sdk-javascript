import { useState } from "react";

import Message from "./Message";
import { useChat } from "./useChat";
import "./App.css";

export default function App() {
  const [username, setUsername] = useState(null);
  const [draft, setDraft] = useState("");
  const { messages, ready, sendMessage } = useChat(username);

  // Ask for a nickname before joining the chat
  if (!username) {
    return (
      <form
        className="wrapper"
        onSubmit={(event) => {
          event.preventDefault();
          setUsername(event.target.elements.username.value.trim() || null);
        }}
      >
        <input autoFocus name="username" placeholder="Enter your nickname" />
        <button type="submit">Join</button>
      </form>
    );
  }

  return (
    <div>
      <form
        className="wrapper"
        onSubmit={async (event) => {
          event.preventDefault();
          await sendMessage(draft.trim());
          setDraft("");
        }}
      >
        <input
          autoFocus
          disabled={!ready}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Enter your message"
          value={draft}
        />
        <button disabled={!ready} type="submit">
          Send
        </button>
      </form>

      <div>
        {messages.map((message) => (
          <Message key={message._id} message={message} username={username} />
        ))}
      </div>
    </div>
  );
}

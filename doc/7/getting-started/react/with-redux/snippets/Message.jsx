export default function Message({ message, username }) {
  const origin = message.username === username ? "fromMe" : "fromOthers";

  return (
    <div className={`${origin} messages`}>
      <span>
        User: <b>{message.username}</b>
      </span>
      <span> ({new Date(message.createdAt).toLocaleString()})</span>
      <p>{message.value}</p>
    </div>
  );
}

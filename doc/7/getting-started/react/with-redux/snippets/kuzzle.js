import { Kuzzle, WebSocket } from "kuzzle-sdk";

// Replace 'localhost' with the hostname of your Kuzzle server
const kuzzle = new Kuzzle(new WebSocket("localhost"));

kuzzle.on("networkError", (error) => {
  console.error("Network Error:", error);
});

export default kuzzle;

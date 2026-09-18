import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import kuzzle from "../services/kuzzle";

// Turns a Kuzzle document into the shape our components expect
export const toMessage = (document) => ({
  _id: document._id,
  value: document._source.value,
  username: document._source.username,
  createdAt: document._source._kuzzle_info.createdAt,
});

export const fetchMessages = createAsyncThunk("messages/fetch", async () => {
  const results = await kuzzle.document.search(
    "chat",
    "messages",
    { sort: { "_kuzzle_info.createdAt": "desc" } },
    { size: 100 },
  );

  return results.hits.map(toMessage);
});

export const sendMessage = createAsyncThunk(
  "messages/send",
  async ({ value, username }) => {
    await kuzzle.document.create("chat", "messages", { value, username });
  },
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    list: [],
    ready: false,
  },
  reducers: {
    // Dispatched by the realtime subscription, for our own messages as well
    messageReceived(state, action) {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.list = action.payload;
      state.ready = true;
    });
  },
});

export const { messageReceived } = messagesSlice.actions;

export default messagesSlice.reducer;

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    messages: [],
    roomID: '',
    nickname: ''
  },
  actions: {
    INIT: async ({ dispatch }, { kuzzle }) => {
      await kuzzle.connect();
      if (!(await kuzzle.index.exists("chat"))) {
        await kuzzle.index.create("chat");
        await kuzzle.collection.create("chat", "messages");
      }
      dispatch('FETCH_MESSAGES', {kuzzle});
    },
    SEND_MESSAGE: async ({ state }, { kuzzle, message }) => {
      await kuzzle.document.create("chat", "messages", {
        value: message,
        username: state.nickname
      });
    },
    FETCH_MESSAGES: async ({ commit, dispatch }, { kuzzle }) => {
      const results = await kuzzle.document.search(
        "chat",
        "messages",
        { sort: ["_kuzzle_info.createdAt"] },
        { size: 100 }
      );
      results.hits.map(hit => {
        commit('ADD_MESSAGE', hit);
      });
      dispatch('SUBSCRIBE_MESSAGES', {kuzzle});
    },
    SUBSCRIBE_MESSAGES: async ({ commit }, { kuzzle }) => {
      const roomID = await kuzzle.realtime.subscribe("chat", "messages", {}, notification => {
        if (
          notification.type === "document" &&
          notification.action === "create"
        ) {
        commit('ADD_MESSAGE', notification.result);
        }
      });
      commit('SET_ROOMID', roomID);
    }
  },
  mutations: {
    ADD_MESSAGE(state, hit) {
      const message = {
        _id: hit._id,
        value: hit._source.value,
        createdAt: hit._source._kuzzle_info.createdAt,
        username: hit._source.username
      };
      state.messages = [message, ...state.messages]
    },
    SET_ROOMID(state, roomID) {
      state.roomID = roomID;
    },
    SET_NICKNAME(state, nickname) {
      state.nicnkame = nickname;
    }
  }
})

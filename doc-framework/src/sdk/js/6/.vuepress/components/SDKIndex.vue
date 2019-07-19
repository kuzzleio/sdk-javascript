<template>
  <div class="Tiles">
    <router-link :to="{path: generateLink('/sdk/js/6/')}" class="Tiles-item">
      <img src="/logos/javascript.svg" alt="js logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Javascript</div>
    </router-link>
    <router-link :to="{path: generateLink('/sdk/go/2/')}" class="Tiles-item">
      <div class="ribbon">
        <span>BETA</span>
      </div>
      <img src="/logos/go.svg" alt="golang logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Golang</div>
    </router-link>
    <router-link :to="{path: generateLink('/sdk/cpp/1/')}" class="Tiles-item">
      <div class="ribbon">
        <span>BETA</span>
      </div>
      <img src="/logos/cpp.svg" alt="c++ logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">C++</div>
    </router-link>
    <router-link :to="{path: generateLink('/sdk/java/2/')}" class="Tiles-item">
      <div class="ribbon">
        <span>BETA</span>
      </div>
      <img src="/logos/java.svg" alt="java logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Java</div>
    </router-link>

    <router-link :to="{path: generateLink('/sdk/php/3/')}" class="Tiles-item">
      <img src="/logos/php.svg" alt="php logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">PHP</div>
    </router-link>
    <router-link :to="{path: generateLink('/sdk/android/3/')}" class="Tiles-item">
      <img src="/logos/android.svg" alt="android logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Android</div>
    </router-link>
    <a href="https://github.com/kuzzleio/sdk-ruby" class="Tiles-item">
      <div class="ribbon">
        <span>ALPHA</span>
      </div>
      <img src="/logos/ruby.svg" alt="ruby logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Ruby</div>
    </a>
    <a href="https://github.com/kuzzleio/sdk-python2" class="Tiles-item">
      <div class="ribbon">
        <span>ALPHA</span>
      </div>
      <img src="/logos/python.svg" alt="python logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Python 2</div>
    </a>
    <a href="https://github.com/kuzzleio/sdk-python3" class="Tiles-item">
      <div class="ribbon">
        <span>ALPHA</span>
      </div>
      <img src="/logos/python.svg" alt="python logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">Python 3</div>
    </a>
    <a href="https://github.com/kuzzleio/sdk-lua" class="Tiles-item">
      <div class="ribbon">
        <span>ALPHA</span>
      </div>
      <img src="/logos/lua.svg" alt="lua logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">LUA</div>
    </a>
    <a href="https://github.com/kuzzleio/sdk-csharp" class="Tiles-item">
      <div class="ribbon">
        <span>ALPHA</span>
      </div>
      <img src="/logos/csharp.svg" alt="csharp logo" class="Tiles-item-logo">
      <div class="Tiles-item-name">C#</div>
    </a>
  </div>
</template>

<script>
const { getValidLinkByRootPath } = require('../util.js');

export default {
  methods: {
    generateLink(path) {
      return getValidLinkByRootPath(path, this.$site.pages);
    }
  }
};
</script>

<style>
</style>

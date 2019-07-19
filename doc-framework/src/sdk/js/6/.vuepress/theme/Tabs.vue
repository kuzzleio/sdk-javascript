<template>
  <!-- Tabs with outline -->
  <nav class="md-tabs" data-md-component="tabs">
    <div class="md-tabs__inner md-grid">
      <ul class="md-tabs__list">
        <li class="md-tabs__group" v-for="part of getLinks">
          <p class="md-tabs__group-name">Use</p>
          <ul class="md-tabs__group-items">
            <li class="md-tabs__item" v-for="link of part">
              <router-link
                :to="getPath(link)"
                :class="{'md-tabs__link--active': $route.path.match(link.path)}"
                :title="link.label"
                class="md-tabs__link"
              >{{ link.label }}</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { getValidLinkByRootPath } from '../util.js';
import links from '../links.json';

export default {
  computed: {
    getLinks() {
      return links;
    }
  },
  methods: {
    getPath(link) {
      return {
        path: link.generateLink ? this.generateLink(link.path) : link.path
      };
    },
    startWith(str, start) {
      return str.indexOf(start) === 0;
    },
    generateLink(path) {
      return getValidLinkByRootPath(path, this.$site.pages);
    }
  }
};
</script>

<style>
</style>

<template>
  <div
    class="md-sidebar md-sidebar--primary"
    :class="{'md-sidebar--open': sidebarOpen}"
    data-md-component="navigation"
  >
    <div class="md-sidebar__scrollwrap" ref="scrollwrap">
      <div class="md-sidebar__inner">
        <nav class="md-nav md-nav--primary" data-md-level="0">
          <label class="md-nav__title md-nav__title--site mobile-only" for="drawer">
            <span class="md-nav__button md-logo">
              <img src="/logo-min.png" width="48" height="48" />
            </span>
            <span>Kuzzle Documentation</span>
          </label>
          <TabsMobile @closeSidebar="$emit('closeSidebar')" />
          <SDKSelector class="md-sidebar--selector" v-if="sdkOrApiPage" :items="sdkList" />
          <!-- Render item list -->
          <ul class="md-nav__list" data-md-scrollfix>
            <div v-for="item__1 in getPageChildren(root)">
              <li class="md-nav__separator">{{item__1.frontmatter.title}}</li>

              <div v-for="item__2 in getPageChildren(item__1)">
                <li class="md-nav__item md-nav-title">
                  <div
                    class="md-nav__link"
                    @click="openOrRedirect(item__1, item__2)"
                    :class="{'md-nav__link--active': $page.path === item__2.path, 'md-nav__item--code': item__2.frontmatter.code == true}"
                  >
                    <div v-if="getPageChildren(item__2).length">
                      <i
                        v-if="openedSubmenu === item__2.title"
                        class="fa fa-caret-down"
                        aria-hidden="true"
                      ></i>
                      <i v-else class="fa fa-caret-right" aria-hidden="true"></i>
                      <span>{{item__2.title}}</span>
                    </div>
                    <div v-else>
                      <span class="no_arrow">{{item__2.title}}</span>
                    </div>
                  </div>
                </li>
                <ul
                  class="md-nav__list sub-menu"
                  :class="subMenuClass(item__1, item__2)"
                  :id="getId([item__1.title, item__2.title])"
                >
                  <div
                    v-for="item__3 of getPageChildren(item__2)"
                    class="md-nav__item"
                    :id="getId([item__1.title, item__2.title, item__3.title])"
                  >
                    <li v-if="$page.path === item__3.path">
                      <router-link
                        class="md-nav__link--active"
                        :class="{'md-nav__item--code': item__3.frontmatter.code}"
                        :to="{path: item__3.path}"
                        :title="item__3.title"
                        @click.native="$emit('closeSidebar')"
                      >
                        <span class="no_arrow">{{item__3.title}}</span>
                      </router-link>
                    </li>
                    <li v-else>
                      <router-link
                        :to="{path: item__3.path}"
                        :title="item__3.title"
                        class="md-nav__link"
                        @click.native="$emit('closeSidebar')"
                        :class="{'md-nav__item--code': item__3.frontmatter.code}"
                      >
                        <span class="no_arrow">{{item__3.title}}</span>
                      </router-link>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import TabsMobile from './TabsMobile.vue';
import { getPageChildren, getFirstValidChild, findRootNode } from '../util.js';
import sdkList from '../sdk.json';

export default {
  components: {
    TabsMobile
  },
  props: {
    sidebarOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      openedSubmenu: '',
      sdkList
    };
  },
  watch: {
    '$route.path': function(path) {
      if (!path.includes(this.openedSubmenu)) {
        const openedSubmenuId = this.sanitize(this.openedSubmenu);
        document.getElementById(openedSubmenuId).style.height = '0px';
        this.openedSubmenu = '';
      }
    }
  },
  computed: {
    sdkOrApiPage() {
      return this.$route.path.match(/(^\/sdk\/|\/core\/1\/api\/)/);
    },
    root() {
      return findRootNode(this.$page, this.$site.pages);
    }
  },
  methods: {
    closeSidebar(item) {
      this.$emit('closeSidebar');
    },
    subMenuClass(item__1, item__2) {
      return this.openedSubmenu === this.getId([item__1.title, item__2.title])
        ? 'displaySubmenu'
        : '';
    },
    getId(itemsTitle) {
      return itemsTitle.reduce(
        (id, item) => id + '_' + this.sanitize(item),
        ''
      );
    },
    sanitize(str) {
      return str.replace(/ /g, '_');
    },
    openOrRedirect(item__1, item__2) {
      const childs = this.getPageChildren(item__2);

      if (!childs.length) {
        this.closeSidebar();
        this.$router.push(item__2.path);
        return;
      }

      if (this.openedSubmenu) {
        const openedSubmenuId = this.sanitize(this.openedSubmenu);
        document.getElementById(openedSubmenuId).style.height = '0px';
      }

      const item2Id = this.getId([item__1.title, item__2.title]);
      const item3Id = this.getId([
        item__1.title,
        item__2.title,
        childs[0].title
      ]);

      if (this.openedSubmenu !== item2Id) {
        const childSize = document.getElementById(item3Id).offsetHeight;
        const menuHeight = `${childs.length * childSize}px`;
        document.getElementById(item2Id).style.height = menuHeight;
      }

      this.openedSubmenu = this.openedSubmenu === item2Id ? '' : item2Id;
      return;
    },
    getPageChildren(page) {
      return getPageChildren(page, this.$site.pages);
    },
    getFirstValidChild(page) {
      return getFirstValidChild(page, this.$site.pages);
    },
    /**
     * @param {Element} target
     */
    isInViewport(target) {
      const rect = target.getBoundingClientRect();

      return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left <
          (window.innerWidth || document.documentElement.clientWidth) &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight)
      );
    }
  },
  mounted() {
    const activeLink = this.$el.querySelector('.md-nav__link--active');
    // !Dis is a ugli ack
    // If you find a better way to determine when the page has finished rendering,
    // you're my hero.
    setTimeout(() => {
      if (activeLink && !this.isInViewport(activeLink)) {
        this.$refs.scrollwrap.scrollTop = activeLink.offsetTop - 50;
      }
    }, 500);
  }
};
</script>

<style lang="scss">
</style>

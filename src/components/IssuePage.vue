<template lang='html'>
  <main id='IssuePage'>
    <div class="metadata">
      <div class="px-3 py-4">
        <h1 class="text-serif font-weight-bold">{{issue.newspaper['name']}}</h1>
        <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        <p><strong><i>Le Temps</i> is a Swiss French-language daily newspaper published in Berliner format in Geneva by Le Temaps SA.</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <hr>
        <named-entity-explorer></named-entity-explorer>
        <hr>
        <pre>{{issue}}</pre>
      </div>
    </div>
    <div class="viewer">
      <issue-viewer v-model="issue" v-bind:activePage="activePage"></issue-viewer>
    </div>
    <div class="userdata" v-bind:class="{active: userDataActive}">
      <a href="#" class="toggle" v-on:click.prevent="toggleUserData()"><i class="icon" v-bind:class="[userDataActive ? 'close' : 'arrow-left']"></i></a>
      <div class="data" v-show="userDataActive">
          <h1>userdata</h1>
      </div>
    </div>
  </main>
</template>

<script>
import NamedEntityExplorer from './modules/NamedEntityExplorer';
import IssueViewer from './modules/IssueViewer';

import * as services from '../services';

export default {
  data: () => ({
    activePage: 0,
    issue: {
      date: '',
      newspaper: {
        name: '',
      },
    },
  }),
  computed: {
    userDataActive: {
      get() {
        return this.$store.state.settings.sidebar_userdata_expanded;
      },
    },
  },
  components: {
    NamedEntityExplorer,
    IssueViewer,
  },
  methods: {
    toggleUserData() {
      this.$store.commit('settings/TOGGLE_USERDATA_EXPANDED');
    },
  },
  mounted() {
    const issueUID = this.$route.params.issue_uid;

    if (this.$route.params.page_number !== undefined) {
      // TODO: here we assume that page number 5 has index 4 (starting at 0 in array)
      // but we could be missing pages, so page number 5 might have index 2 for example
      // We need to fix this so that the initial active page number corresponds with
      // the correct index in the array
      this.activePage = parseInt(this.$route.params.page_number, 10) - 1;
    }

    services.issues.get(issueUID, {}).then((response) => {
      this.issue = response;
    });
  },
};
</script>

<style scoped lang='less'>
@import "./../assets/less/style.less";

@width_sidebar_userdata_contracted: 52px;

#IssuePage {
    display: flex;
    position: absolute;
    bottom: 0;
    top: 43px;
    width: 100%;
    .metadata {
        width: 350px;
        height: 100%;
        overflow-y: auto;
        background: @clr-grey-300;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .viewer {
        width: 500px;
        flex: 1;
    }

    .userdata {
        width: @width_sidebar_userdata_contracted;
        display: flex;
        .data{
          flex: 1;
        }

        &.active {
            width: 300px;
        }

        .toggle {
            display: block;
            margin: 5px;
            width: @width_sidebar_userdata_contracted - 10px;
            height: @width_sidebar_userdata_contracted - 10px;
            .icon {
                transform: scale(2) translate(5px, 5px);
                color:@clr-grey-600;
                transition: color 200ms;
            }

            &:hover{
              .icon{
                color:@clr-blue-grey-600;
              }
            }
        }
    }

}
</style>

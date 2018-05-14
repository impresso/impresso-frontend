<template lang='html'>
  <main id='IssuePage'>
    <div class="metadata">
      <div class="px-3 py-4">
        <h1 class="text-serif font-weight-bold">{{issue.newspaper['name']}}</h1>
        <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        <p><strong><i>Le Temps</i> is a Swiss French-language daily newspaper published in Berliner format in Geneva by Le Temaps SA.</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <hr>
        <named-entity-explorer v-model="issue"></named-entity-explorer>
        <hr>
        <pre>{{issue}}</pre>
      </div>
    </div>
    <div class="viewer">
      <issue-viewer v-model="issue" v-bind:activePage="activePage"></issue-viewer>
    </div>
    <div class="userdata" v-bind:class="{active: userDataActive}">
      <a href="#" v-on:click="toggleUserData">toggle</a>
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
    userDataActive: false,
  }),
  components: {
    NamedEntityExplorer,
    IssueViewer,
  },
  methods: {
    toggleUserData() {
      this.userDataActive = !this.userDataActive;
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
      console.log(this.issue);
      this.issue = response;
    });
  },
};
</script>

<style scoped lang='less'>
@import "./../assets/less/style.less";

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
        width: 80px;
        &.active {
            width: 300px;
        }
    }
}
</style>

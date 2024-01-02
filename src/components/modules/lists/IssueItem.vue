<template>
  <b-card class="IssueItem">
    <router-link :to="routerLinkUrl">
      <b-card-img-lazy
        class="bg-light border"
        :src="item.frontPage.getIiifThumbnail({ dim: 700 })"
        :alt="$d(item.date, 'long')"
        top
      />
    </router-link>
    <b-card-body>
      <router-link :to="routerLinkUrl">
        <span class="date">{{ $d(new Date(item.date), 'long') }}</span>
      </router-link>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    routerLinkUrl() {
      return {
        name: 'issue-viewer',
        params: {
          issue_uid: this.item.uid,
        },
        query: {
          ...this.$route.query,
          p: this.item.frontPage.num,
        },
      }
    },
  },
}
</script>

<style lang="css" scoped>
.date {
  text-transform: lowercase;
  font-variant: small-caps;
}
</style>

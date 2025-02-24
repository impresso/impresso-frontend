<template>
  <div class="IssueItem card">
    <auth-img class="card-img-top" :src="computedIIIFFrontPageSrc" alt="Card image cap" />
    <div class="card-body">
      <router-link :to="routerLinkUrl">
        <span>{{ $d(new Date(item.date), 'long') }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import AuthImg from '@/components/AuthImg.vue'
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    size: {
      type: Number,
      default: 400
    }
  },
  computed: {
    computedIIIFFrontPageSrc() {
      return this.item.frontPage.getIiifThumbnail({ dim: this.size })
    },
    routerLinkUrl() {
      return {
        name: 'issue-viewer',
        params: {
          issue_uid: this.item.uid
        },
        query: {
          ...this.$route.query,
          p: this.item.frontPage.num
        }
      }
    }
  },
  components: {
    AuthImg
  }
}
</script>

<style lang="css" scoped>
.date {
  text-transform: lowercase;
  font-variant: small-caps;
}
</style>

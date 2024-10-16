<template lang="html">
  <div class="image-item" @click="gotoPage">
    <img-authentified
      v-if="shouldForwardAuthentication"
      :height="height"
      class="image"
      :src="srcCORSFriendly"
      :headers="headers"
    >
      <template v-slot:loading>
        <LoadingIndicator />
      </template>
    </img-authentified>
    <img
      v-else-if="hasValidSrc"
      :height="height"
      class="image"
      :class="imageClass"
      :src="srcCORSFriendly"
    />
    <div v-else>{{ $t('iiif.missing') }}</div>
    <!-- v-if="showMeta" -->
    <div v-if="showMeta">
      <p v-if="hasTitle" class="item-title p-2 m-0">{{ item.title }}</p>
      <div class="p-2 articles-meta">
        <router-link
          :to="{ name: 'newspaper', params: { newspaper_uid: item?.newspaper?.uid ?? 'na' } }"
          class="article-newspaper"
        >
          {{ item?.newspaper?.name }}
        </router-link>
        <item-selector :uid="item?.newspaper?.uid" :item="item?.newspaper" type="newspaper" />
        &nbsp;
        <span class="date">{{ $d(item?.date ?? 0, 'long') }}</span>
        <span> – {{ pages }}</span>
      </div>
    </div>
    <figcaption class="py-2" v-else-if="hasTitle">{{ item.title }}</figcaption>
  </div>
</template>

<script>
import ItemSelector from '@/components/modules/ItemSelector.vue'
import ImgAuthentified from '@/components/base/ImgAuthentified.vue'
import LoadingIndicator from '@/components/modules/LoadingIndicator.vue'
import { image } from 'd3'

export default {
  props: {
    height: Number,
    center: Boolean,
    fluid: Boolean,
    fluidGrow: Boolean,
    item: Object,
    showMeta: Boolean,
    showArticle: Boolean,
    // headers containing authentication, if any
    headers: Object
  },
  computed: {
    imageClass() {
      return {
        'img-fluid': this.fluidGrow,
        'w-100': this.fluidGrow,
        'mx-auto': this.center,
        'd-block': this.center
      }
    },
    pages() {
      return this.$tc('pp', this.item?.nbPages ?? 0, {
        pages: this.item?.pages?.map(d => d.num).join(',') ?? ''
      })
    },
    hasTitle() {
      if (!this.item) {
        return false
      }
      return typeof this.item.title === 'string' && this.item.title.length > 0
    },
    hasValidSrc() {
      if (!this.item) {
        return false
      }
      return Array.isArray(this.item.regions) && this.item.regions.length > 0
    },
    srcCORSFriendly() {
      if (
        import.meta.env.NODE_ENV === 'production' &&
        this.hasValidSrc &&
        this.item.regions[0].iiifFragment.indexOf(import.meta.env.VITE_BASE_URL) === 0
      ) {
        return this.src.replace(import.meta.env.VITE_BASE_URL, window.location.origin)
      } else if (import.meta.env.NODE_ENV !== 'production') {
        console.debug(
          '[ImageItem] Cannot test srcCORSFriendly in development mode :( for item:',
          this.item.uid
        )
      }
      return this.src
    },
    src() {
      return this.hasValidSrc ? this.item.regions[0].iiifFragment : null
    },
    shouldForwardAuthentication() {
      if (this.hasValidSrc) {
        return this.item.regions[0].iiifFragment.indexOf(import.meta.env.VITE_BASE_URL) === 0
      }
      return false
    }
  },
  methods: {
    gotoPage() {
      if (this.item == null) {
        console.error('No item to go to page')
        return
      }
      const params = {
        issue_uid: this.item.issue?.uid || this.item.uid.match(/(^.+)-i/)[1],
        page_uid: this.item.pages[0]?.uid
      }
      console.info('gotoPage', params, this.item.article)
      if (this.item.article) {
        this.$router.push({
          name: 'article',
          params: {
            ...params,
            article_uid: this.item.article.uid
          }
        })
      } else {
        this.$router.push({
          name: 'page',
          params
        })
      }
    }
  },
  components: {
    ItemSelector,
    ImgAuthentified,
    LoadingIndicator
  }
}
</script>

<style lang="scss">
.image-item {
  min-height: 200px;
  .article-newspaper {
    font-weight: bold;
  }
  .date {
    text-transform: lowercase;
    font-variant: small-caps;
  }
  .articles-meta {
    font-size: 14px;
  }
  .item-title {
    background: #eff0f0;
  }
  figcaption {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 300px;
  }
}
</style>

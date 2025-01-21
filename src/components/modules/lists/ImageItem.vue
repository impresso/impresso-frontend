<template>
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
      <p v-if="hasCaption" class="item-title p-2 m-0">{{ item.caption }}</p>
      <div class="p-2 articles-meta">
        <router-link
          :to="{ name: 'newspaper', params: { newspaper_uid: item?.mediaSourceRef?.uid ?? 'na' } }"
          class="article-newspaper"
        >
          {{ item?.mediaSourceRef?.name }}
        </router-link>
        <item-selector
          :uid="item?.mediaSourceRef?.uid"
          :item="item?.mediaSourceRef"
          type="newspaper"
        />
        &nbsp;
        <span class="date">{{ $d(item?.date ?? 0, 'long') }}</span>
        <span> – {{ pageNumbers }}</span>
      </div>
    </div>
    <figcaption class="py-2" v-else-if="hasCaption">{{ item.caption }}</figcaption>
  </div>
</template>

<script lang="ts">
import ImgAuthentified from '@/components/base/ImgAuthentified.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import LoadingIndicator from '@/components/modules/LoadingIndicator.vue'
import { IImage } from '@/models'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    height: Number,
    center: Boolean,
    fluid: Boolean,
    fluidGrow: Boolean,
    item: Object as PropType<IImage>,
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
    pageNumbers() {
      return this.$tc('pp', this.item?.pageNumbers?.length ?? 0, {
        pages: this.item?.pageNumbers?.join(',') ?? ''
      })
    },
    hasCaption() {
      return (this.item?.caption?.length ?? 0) > 0
    },
    hasValidSrc() {
      return this.item?.previewUrl != null
      // if (!this.item) {
      //   return false
      // }
      // return Array.isArray(this.item.regions) && this.item.regions.length > 0
    },
    srcCORSFriendly() {
      if (
        import.meta.env.NODE_ENV === 'production' &&
        this.hasValidSrc &&
        this.item?.previewUrl?.indexOf(import.meta.env.VITE_BASE_URL) === 0
        // this.item.regions[0].iiifFragment.indexOf(import.meta.env.VITE_BASE_URL) === 0
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
      // return this.hasValidSrc ? this.item.regions[0].iiifFragment : null
      return this.hasValidSrc ? this.item?.previewUrl : null
    },
    shouldForwardAuthentication() {
      if (this.hasValidSrc) {
        // return this.item.regions[0].iiifFragment.indexOf(import.meta.env.VITE_BASE_URL) === 0
        return this.item?.previewUrl?.indexOf(import.meta.env.VITE_BASE_URL) === 0
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
      const articleId = this.item.uid.split('-').pop()

      this.$router.push({
        name: 'issue-viewer',
        params: {
          issue_uid: this.item?.issueUid
        },
        query: {
          articleId,
          p: this.item?.pageNumbers?.[0]
        }
      })
    }
  },
  components: {
    ItemSelector,
    ImgAuthentified,
    LoadingIndicator
  }
})
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

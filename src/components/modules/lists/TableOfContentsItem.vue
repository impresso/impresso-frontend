<template>
  <div class="TableOfContentsItem">
    <div :class="{ media: true, active }">
      <div class="media-body">
        <article-item
          :item="item"
          class="p-3 clearfix"
          show-excerpt
          show-entities
          show-pages
          show-matches
          show-type
        >
          <template v-slot:title>
            <h2 class="font-weight-bold text-decoration-underline">
              {{ item.title }}
            </h2>
          </template>
          <template v-slot:actions>
            <slot name="actions"></slot>
          </template>
        </article-item>
        <div v-bind:key="i" v-for="(image, i) in item.images">
          <image-item :height="200" class="mx-3 mb-2" :item="image" />
          <div class="ml-3 mb-3">
            <router-link class="btn btn-outline-secondary btn-sm" :to="getSimilarImagesHref(image)">
              get similar images
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ArticleItem from '@/components/modules/lists/ArticleItem.vue'
import ImageItem from '@/components/modules/lists/ImageItem.vue'

export default {
  props: {
    active: Boolean,
    item: Object
  },
  methods: {
    getSimilarImagesHref(image) {
      return `/search/images?p=1&similarTo=${image.uid}`
    }
  },
  components: {
    ArticleItem,
    ImageItem
  }
}
</script>

<style lang="scss">
.TableOfContentsItem {
  h2 {
    font-size: 1.1em;
  }
  .active {
    box-shadow: inset 0.15em 0 #343a40;
    background-color: #f2f2f2;
  }
}
</style>

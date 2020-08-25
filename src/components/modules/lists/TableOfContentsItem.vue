<template lang="html">
  <b-media :class="{ active }">
    <article-item :item="item" class="p-3 clearfix"
      show-excerpt
      show-entities
      show-size
      show-pages
      show-matches
      show-type>
      <template v-slot:title>
        <h2>
          {{item.title}}
        </h2>
      </template>
      <template v-slot:actions>
        <slot name="actions"></slot>
      </template>
    </article-item>
  </b-media>
</template>

<script>
import ArticleItem from '@/components/modules/lists/ArticleItem'

export default {
  props: {
    active: Boolean,
    item: Object
  },
  components: {
    ArticleItem
  }
}
</script>

<style lang="scss" scoped>
.active{
  box-shadow: inset 0.15em 0 #343a40;
  background-color: #f2f2f2;

  h2{
    font-weight: bold;
  }
}
</style>

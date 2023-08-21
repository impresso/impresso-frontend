<template>
  <li>
    <div class="badge small-caps">{{ item.language }}</div>
    <router-link
      :to="{ name: 'topic', params: { topic_uid: item.uid } }"
      v-html="item.getHtmlExcerpt()"
    />
    <div class="small-caps">{{ item.model }}</div>
  </li>
</template>

<script>
export default {
  props: ['item'],
}
</script>

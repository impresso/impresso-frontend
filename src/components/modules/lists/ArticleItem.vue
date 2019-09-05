<template lang="html">
  <article>
    <h2 v-if="item.title" class="mb-0">
      <router-link :to="{ name: 'article', params: {
        issue_uid: item.issue.uid,
        page_uid: item.pages[0].uid,
        article_uid: item.uid,
      } }" v-html="item.title"></router-link>
    </h2>
    <div class="article-meta">
      <router-link :to="{ name: 'newspaper', params: { newspaper_uid: item.newspaper.uid }}">
        <strong>{{ item.newspaper.name}}</strong>
      </router-link>
      <item-selector :uid="item.newspaper.uid" :item="item.newspaper" type="newspaper"/>,
      <span class="small-caps">{{ $d(item.date, "long") }}</span>
      <span>({{ $tc('pp', item.nbPages, { pages: item.pages.map(d => d.num).join(',') }) }})</span>
    </div>
    <div v-if="showExcerpt" class="article-excerpt mt-2">{{ item.excerpt }}</div>
    <div v-if="showEntities" class="small article-extras article-entities mt-2">
      <div v-if="item.locations.length">
        <b-badge variant="light" class="mr-1 small-caps">locations</b-badge>
        <span v-for="(location, idx) in item.locations" v-bind:key="idx">
          <item-label :item="location" type="location" />
          <item-selector :uid="location.uid" :item="location" type="location"/>
          <span v-if="idx !== item.locations.length - 1">, </span>
        </span>
      </div>
      <div v-if="item.persons.length">
        <b-badge variant="light" class="mr-1 small-caps">people</b-badge>
        <span v-for="(person, idx) in item.persons" v-bind:key="idx">
          <item-label :item="person" type="person" />
          <item-selector :uid="person.uid" :item="person" type="person"/>
          <span v-if="idx !== item.persons.length - 1">, </span>
        </span>
      </div>
    </div>
    <div v-if="showTopics" class="small article-extras article-topics mt-2">
      <div v-if="item.topics.length">
        <b-badge variant="light" class="mr-1 small-caps">topics</b-badge>
        <span v-for="(rel, idx) in item.topics" v-bind:key="idx">
          <item-label :item="rel.topic" type="topic" />
          <span class="text-muted">({{ $n(rel.relevance * 100) }}&nbsp;%)</span>
          <item-selector :uid="rel.topic.uid" :item="rel.topic" type="topic"/>
          <span v-if="idx !== item.topics.length - 1">, </span>
        </span>
      </div>
    </div>
  </article>
</template>

<script>
import ItemSelector from './../ItemSelector';
import ItemLabel from './ItemLabel';

export default {
  props: {
    item: {
      type: Object,
    },
    showExcerpt: {
      type: Boolean,
      default: true,
    },
    showEntities: {
      type: Boolean,
      default: false,
    },
    showTopics: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ItemSelector,
    ItemLabel,
  },
};
</script>

<style lang="css" scoped>
  .article-extras .badge{
    font-size: inherit;
  }
</style>

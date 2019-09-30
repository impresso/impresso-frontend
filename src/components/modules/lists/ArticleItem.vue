<template lang="html">
  <article>
    <h2 v-if="item.title" class="mb-0">
      <router-link v-if="showLink" :to="{ name: 'article', params: routerLinkParams }" v-html="item.title"></router-link>
      <span v-else v-html="item.title"></span>
    </h2>
    <div v-else>
      <router-link v-if="showLink" :to="{ name: 'article', params: routerLinkParams }" v-html="$t('untitled')"></router-link>
      <span v-else>{{ $t('untitled') }}</span>
    </div>
    <div v-if="showMeta" class="article-meta">
      <router-link :to="{ name: 'newspaper', params: { newspaper_uid: item.newspaper.uid }}">
        <strong>{{ item.newspaper.name}}</strong>
      </router-link>
      <item-selector :uid="item.newspaper.uid" :item="item.newspaper" type="newspaper"/>,
      <span class="small-caps">{{ $d(item.date, "long") }}</span>
      <span>{{ pages }}</span>
    </div>


    <div v-if="showExcerpt && item.type !=='image'" class="article-excerpt mt-2">
      <span >{{ item.excerpt }}</span>
      <b-badge v-if="showSize || showType" variant="light" class="mr-1 pt-1">
        <span v-if="showType">{{ $t(`buckets.type.${item.type}`) }} | </span>
        <span v-if="showSize">
          <span v-if="item.size > 1200">{{ $t('readingTime', { min: parseInt(item.size / 1200) }) }}</span>
          <span v-else>{{ $t('reducedReadingTime')}}</span>
        </span>
      </b-badge>
      <span v-if="showPages">{{ pages }}</span>
    </div>

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
        <span v-for="(rel, idx) in item.topics" v-bind:key="idx" class="position-relative d-inline-block">
          <div class="bg-accent-secondary position-absolute"
            :style="`width:${rel.relevance * 100}%;
            height:100%; left: 15px; top:4px; height:calc( 100% - 6px); mix-blend-mode: multiply`" />
          <item-label :item="rel.topic" type="topic" />
          <span class="text-muted">({{ $n(rel.relevance * 100) }}&nbsp;%)</span>
          <item-selector :uid="rel.topic.uid" :item="rel.topic" type="topic"/>
          <span v-if="idx !== item.topics.length - 1">, </span>
        </span>
      </div>
    </div>
    <div v-if="showMatches">
      <ul v-if="item.matches.length" class="article-matches mt-1 p-0">
        <li
          class="pl-3 mb-2"
          v-for="(match, i) in item.matches"
          v-bind:key="i"
          v-html="match.fragment"
          v-show="match.fragment.trim().length > 0" />
      </ul>
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
    },
    showMatches: {
      type: Boolean,
    },
    showPages: {
      type: Boolean,
    },
    showSize: {
      type: Boolean,
    },
    showLink: {
      type: Boolean,
    },
    showMeta: {
      type: Boolean,
    },
    showType: {
      type: Boolean,
    },
    showEntities: {
      type: Boolean,
    },
    showTopics: {
      type: Boolean,
    },
  },
  computed: {
    pages() {
      return this.$tc('pp', this.item.nbPages, { pages: this.item.pages.map(d => d.num).join(',') });
    },
    routerLinkParams() {
      const params = {
        article_uid: this.item.uid,
        page_uid: this.item.pages[0].uid,
      };
      if (this.item.issue) {
        params.issue_uid = this.item.issue.uid;
      } else {
        params.issue_uid = this.item.uid.match(/(^.+)-i/)[1];
      }
      return params;
    },
  },
  components: {
    ItemSelector,
    ItemLabel,
  },
};
</script>

<style lang="scss" scoped>
  .article-extras .badge{
    font-size: inherit;
  }
  .article-excerpt{
    font-size: smaller;
  }
  ul.article-matches{
    list-style-type: none;
    font-size: smaller;
  }
  ul.article-matches li{
    border-left: 2px solid gold;
  }
</style>

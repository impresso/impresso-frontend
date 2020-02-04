<template lang="html">
  <router-link :to="{ name: 'article', params: routerLinkParams }" class="titleblock article-meta p-2 border-top">
  <article :class="{ reference : asReference }">
    <h2 v-if="item.title" class=" pr-4 article-title" v-html="item.title" />
    <div v-if="showMeta" class="article-meta">
      <router-link :to="{ name: 'newspaper', params: { newspaper_uid: item.newspaper.uid }}" class="article-newspaper">
        {{ item.newspaper.name}}
      </router-link>
      <item-selector :uid="item.newspaper.uid" :item="item.newspaper" type="newspaper"/><br/>
      <span class="date">{{ $d(item.date, "long") }}</span> &mdash;
      <span>{{ pages }}</span>
    </div>


    <div v-if="showExcerpt && item.type !=='image'" class="article-excerpt mt-2">
      <span class="article-excerpt">{{ item.excerpt }}</span>
      <b-badge v-if="showSize || showType" variant="light" class="mr-1 pt-1">
        <span v-if="showType && item.type">{{ $t(`buckets.type.${item.type}`) }} | </span>
        <span v-if="showSize">
          <span v-if="item.size > 1200">{{ $t('readingTime', { min: parseInt(item.size / 1200) }) }}</span>
          <span v-else>{{ $t('reducedReadingTime')}}</span>
        </span>
      </b-badge>
      <span v-if="showPages">{{ pages }}</span>
    </div>

    <div v-if="showEntities" class="small article-extras article-entities mt-2">
      <div v-if="item.locations.length">
        <b-badge variant="light" class="mr-1 small-caps bg-medium">locations</b-badge>
        <span v-for="(location, idx) in item.locations" v-bind:key="idx">
          <item-label :item="location" type="location" />
          <item-selector :uid="location.uid" :item="location" type="location"/>
          <span v-if="idx !== item.locations.length - 1">, </span>
        </span>
      </div>
      <div v-if="item.persons.length">
        <b-badge variant="light" class="mr-1 small-caps bg-medium">people</b-badge>
        <span v-for="(person, idx) in item.persons" v-bind:key="idx">
          <item-label :item="person" type="person" />
          <item-selector :uid="person.uid" :item="person" type="person"/>
          <span v-if="idx !== item.persons.length - 1">, </span>
        </span>
      </div>
    </div>
    <div v-if="showTopics" class="small article-extras article-topics mt-2">
      <b-badge variant="light" class="mr-1 small-caps bg-medium">topics</b-badge>
      <div v-if="item.topics.length">
        <div v-for="(rel, idx) in item.topics" v-bind:key="idx" class="mx-1 mb-1">
          <viz-bar
            :percent="rel.relevance * 100"
            :uid="rel.topic.uid"
            :item="rel.topic"
            type="topic"
            />
        </div>
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
    <!-- {{ item.issue.accessRights }} -->
  </article>
</router-link>
</template>

<script>
import ItemSelector from '../ItemSelector';
import ItemLabel from './ItemLabel';
import VizBar from '../../base/VizBar';

export default {
  props: {
    item: Object,
    showExcerpt: Boolean,
    showMatches: Boolean,
    showPages: Boolean,
    showSize: Boolean,
    showLink: Boolean,
    showHref: Boolean,
    showMeta: Boolean,
    showType: Boolean,
    showEntities: Boolean,
    showTopics: Boolean,
    asReference: Boolean,
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
  methods: {
    onClick() {
      this.$emit('click:title', {
        name: 'article',
        params: this.routerLinkParams,
      });
    },
  },
  components: {
    ItemSelector,
    ItemLabel,
    VizBar,
  },
};
</script>

<style lang="scss" scoped>
  .titleblock {
    display:block;
    &:hover {
      text-decoration: none;
      border-color: black !important;
    }
  }
  .article-title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    // display: block;
    // background: red;
    // max-height: 13.5em;
  }
  .article-newspaper {
    font-weight: bold;
  }
  .date {
    text-transform: lowercase;
    font-variant: small-caps;
  }
  article.reference {
    h2, .article-meta {
      font-size: inherit;
      display: inline-block;
    }
    h2::after {
      content: ', ';
    }
    .date {
      text-transform: none;
      font-variant: normal;
    }
    .article-newspaper{
      font-weight: normal;
    }

    .article-excerpt{
      margin-top: auto !important;
      font-size: inherit;
    }
  }
  .article-extras .badge{
    font-size: inherit;
  }
  .article-excerpt{
    font-size: smaller;
  }
  .article-topics > div{
    columns: 4 270px;
    div {
      break-inside: avoid-column;
    }
  }
  ul.article-matches{
    list-style-type: none;
    font-size: smaller;
  }
  ul.article-matches li{
    border-left: 2px solid gold;
  }
</style>

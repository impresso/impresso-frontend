<template>
  <article :class="{ reference: asReference, ArticleItem: true }">
    <slot name="title">
      <h2 v-if="item.title" class="mb-0 font-weight-bold" data-testid="article-title">
        <router-link v-if="showLink" :to="routerLinkUrl" v-html="item.title"></router-link>
        <a v-else-if="showHref" v-on:click.prevent="onClick" v-html="item.title"></a>
        <span v-else v-html="item.title"></span>
      </h2>
      <div v-else>
        <router-link v-if="showLink" :to="routerLinkUrl" v-html="$t('untitled')"></router-link>
        <a v-else-if="showHref" v-on:click.prevent="onClick">{{ $t('untitled') }}</a>
        <span v-else>{{ $t('untitled') }}</span>
      </div>
    </slot>
    <div v-if="showMeta" class="article-meta">
      <router-link :to="{ name: 'newspaper', params: { newspaper_uid: item?.newspaper?.uid } }"
        class="article-newspaper">
        {{ item.newspaper.name }}
      </router-link>
      <item-selector :uid="item?.newspaper?.uid" :item="item?.newspaper" type="newspaper" /> &nbsp;
      <span data-testid="article-date">{{ item.date ? $d(item.date, 'long') : '' }}</span>
      <span data-testid="article-pages-count"> – {{ pages }}</span>
      <div data-testid="article-access-rights">
        {{ $t(`buckets.accessRight.${item.accessRight}`) }} &mdash; {{ $t('providedBy') }}
        <ItemSelector :uid="item.dataProvider" :label="$t(`buckets.dataProvider.${item.dataProvider}`)"
          :item="{ uid: item.dataProvider }" type="partner" />
      </div>
    </div>

    <div v-if="showExcerpt && !item?.matches?.length && item.type !== 'image'" class="article-excerpt mt-2">
      <span class="article-excerpt">{{ item.excerpt }}</span>
      <b-badge v-if="showSize || showType" variant="light" class="mr-1 pt-1">
        <span v-if="showType && item.type">{{ $t(`buckets.type.${item.type}`) }} | </span>
        <span v-if="showSize">
          <span v-if="item.size > 1200">{{
            $t('readingTime', { min: parseInt(item.size / 1200) })
            }}</span>
          <span v-else>{{ $t('reducedReadingTime') }}</span>
        </span>
      </b-badge>
      <span v-if="showPages">{{ pages }}</span>
    </div>

    <slot name="actions"></slot>

    <div v-if="showEntities" class="article-extras article-entities mt-2">
      <div v-if="item.locations?.length" data-testid="article-locations">
        <b-badge variant="light" class="mr-1 small-caps bg-medium">locations</b-badge>
        <span class="small" v-for="(location, idx) in item.locations" v-bind:key="idx">
          <item-selector :uid="location.uid" :label="location.name" :item="location" type="location" />
          <span v-if="idx !== item.locations.length - 1">, </span>
        </span>
      </div>
      <div v-if="item.persons?.length" data-testid="article-persons">
        <b-badge variant="light" class="mr-1 small-caps bg-medium">people</b-badge>
        <span class="small" v-for="(person, idx) in item.persons" v-bind:key="idx">
          <item-selector :uid="person.uid" :label="person.name" :item="person" type="person" />
          <span class="small" v-if="idx !== item.persons.length - 1">, </span>
        </span>
      </div>
    </div>
    <div v-if="showTopics" class="small article-extras article-topics my-2" data-testid="article-topics">
      <b-badge variant="light" class="mr-1 small-caps bg-medium">topics</b-badge>
      <b-row v-if="item.topics.length">
        <b-col lg="6" xl="4" class="my-1" v-for="(rel, idx) in item.topics" v-bind:key="idx">
          <viz-bar show-border show-percent :percent="rel.relevance * 100" :uid="rel.topic.uid" :item="rel.topic"
            type="topic" />
        </b-col>
      </b-row>
    </div>
    <div v-if="showMatches">
      <ul v-if="item.matches.length" class="article-matches d-flex flex-wrap mt-1 p-0">
        <li class="p-1 mb-2 mr-2 me-2 rounded" v-for="(match, i) in item.matches" v-bind:key="i" v-html="match.fragment"
          v-show="match.fragment.trim().length > 0" />
      </ul>
    </div>
    <slot name="footer"></slot>
  </article>
</template>

<script>
import ItemSelector from '../ItemSelector.vue'
import VizBar from '../../base/VizBar.vue'
import { getShortArticleId } from '@/logic/ids'

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
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
      return this.$tc('pp', this.item.nbPages, { pages: this.item.pages?.map(d => d.num)?.join(',') })
    },
    routerLinkUrl() {
      const issueUid = this.item.issue ? this.item.issue.uid : this.item?.uid?.match(/(^.+)-i/)?.[1]
      return {
        name: 'issue-viewer',
        params: {
          issue_uid: issueUid,
        },
        query: {
          ...this.$route.query,
          articleId: this.item.uid ? getShortArticleId(this.item.uid) : undefined,
          p: this.item.pages?.[0]?.num,
        },
      }
    },
    routerLinkParams() {
      const params = {
        article_uid: this.item.uid,
        page_uid: this.item.pages[0]?.uid,
      }
      if (this.item.issue) {
        params.issue_uid = this.item.issue.uid
      } else {
        params.issue_uid = this.item.uid.match(/(^.+)-i/)[1]
      }
      return params
    },
  },
  methods: {
    onClick() {
      this.$emit('click:title', {
        name: 'article',
        params: this.routerLinkParams,
      })
    },
  },
  components: {
    ItemSelector,
    VizBar,
  },
}
</script>

<style lang="scss">
.ArticleItem .article-newspaper {
  font-weight: bold;
}

.ArticleItem .date {
  text-transform: lowercase;
  font-variant: small-caps;
}

.ArticleItem {
  h2 {
    font-size: 1.2em;
  }
}

.ArticleItem.reference {

  h2,
  .article-meta {
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

  .article-newspaper {
    font-weight: normal;
  }

  .article-excerpt {
    margin-top: auto !important;
    font-size: inherit;
  }
}

.ArticleItem .article-topics>div {
  columns: 4 270px;

  div {
    break-inside: avoid-column;
  }
}

.ArticleItem ul.article-matches {
  list-style-type: none;
  font-size: smaller;
}

.ArticleItem ul.article-matches li {
  border-left-width: 0 !important;
  background: var(--impresso-color-yellow-alpha-30);
  margin: 0.1rem 0.5rem 0.25rem 0rem !important;
}
</style>

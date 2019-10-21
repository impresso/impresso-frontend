<template lang="html">
  <div class="mention-item item">
    <div v-if="item.article">
      <b-row>
        <!-- <pre>{{item.article}}</pre> -->

        <b-col>
          <div v-if="item.t">
            …{{item.t}}…
          </div>
          <div v-if="item.fn == null">
            <span class="small-caps">Function</span>
            <span>{{item.fn}}</span>
          </div>
          <div v-if="item.confidence == null">
            <span class="small-caps">Confidence</span> <span>o{{$t(`confidence.${item.confidence}`)}}</span>
          </div>
          <div v-if="item.demonym == null">
            <div class="small-caps">demonym</div>
            {{item.demonym}}
          </div>
        </b-col>

        <b-col cols="6">
          <div v-if="item.article.excerpt.length > 0" class="article-excerpt mb-2">
            {{item.article.excerpt}}
          </div>

            <router-link :to="{ name: 'article', params: {
              issue_uid: item.article.issue.uid,
              page_uid: item.article.pages[0].uid,
              article_uid: item.article.uid,
            } }" class="btn btn-sm btn-outline-primary">
              {{$t('view')}}
            </router-link>
        </b-col>

        <b-col>
          <div class="article-meta mb-2">
            <strong v-if="item.article.title" class="mb-1">
              {{item.article.title}}
            </strong>
            <router-link :to="{ name: 'newspaper', params: { newspaper_uid: item.article.newspaper.uid }}">
            <div class="link">{{item.article.newspaper.name}}</div>
            </router-link>
            <p class="small-caps">{{$d(new Date(item.article.date), "compact")}}
              (p. <span>{{item.article.pages.map(page => page.num).join('; ')}}</span>)
            </p>
          </div>
        </b-col>

      </b-row>

      <div class="w-25">

      </div>
      <div class="w-50 px-2">



      </div>
      <div class="w-25">

        <!-- {{mention}} -->
      </div>
    </div>
    <div v-else>
      <div v-if="item.t">
        …{{item.t}}…
      </div>
      <div v-if="item.fn">
        <span class="small-caps">Function</span>
        <span>{{item.fn}}</span>
      </div>
      <div v-if="item.confidence">
        <span class="small-caps">Confidence</span> <span>{{$t(`confidence.${item.confidence}`)}}</span>
      </div>
      <div v-if="item.demonym">
        <div class="small-caps">demonym</div>
        {{item.demonym}}
      </div>
    </div>
  </div>
  <!-- <pre>{{mention}}</pre> -->
</template>

<script>
export default {
  props: {
    item: Object,
    required: true,
  },
};
</script>

<style lang="css" scoped>
</style>

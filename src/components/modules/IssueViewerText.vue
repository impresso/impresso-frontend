<template lang="html">
  <div id="IssueViewerText" class="container-fluid py-3">
    <i-layout>
      <i-layout-section>
        <h5>{{article.title}}</h5>
        <b-dropdown size="sm" variant="outline-primary" text="Add to Collection ...">
          <collection-add-to style="margin: -0.5em 0 -0.5em 0" />
        </b-dropdown>
        <div
          class="row mt-3 mb-3"
          v-for="(region, i) in article.regions"
          v-bind:key="i">
          <div class="col col-sm-7">
            <div class='region serif'>
              <p v-for="contents in region.g" >
                <span v-html="contents"></span>
              </p>
            </div>
          </div>
          <div class="col">
            <img v-bind:src="region.iiifFragment" width="100%" />
          </div>
        </div>
      </i-layout-section>
      <!-- <i-layout-section width="200px" class="text-right">
        <h5>{{article.title}}</h5>
        <b-button-group>
          <b-button size="sm" variant="outline-primary">Add Tag ...</b-button>
        </b-button-group>
        <hr>
        <b-dropdown size="sm" variant="outline-primary" text="Add to Collection ...">
          <collection-add-to style="margin: -0.5em 0 -0.5em 0" />
        </b-dropdown>
        <br>
        <span class="badge badge-secondary">Novels</span>
        <span class="badge badge-secondary">Poems</span>
        <hr>
        <b-button size="sm" variant="outline-primary">Export Citations ...</b-button><br>
        <b-button size="sm" variant="outline-primary">Download as ...</b-button>
        <hr>
        <base-title-bar>Entities in Article</base-title-bar>
        <br>
        <label class="mr-1" for="eorderby">Order by</label>
        <b-dropdown id="eorderby" variant="outline-primary" size="sm" text="relevance" class="">
          <b-dropdown-item>First Action</b-dropdown-item>
        </b-dropdown>
      </i-layout-section> -->
    </i-layout>
  </div>
</template>

<script>
import * as services from '@/services';
import Article from '@/models/Article';
import BaseTitleBar from './../base/BaseTitleBar';
import CollectionAddTo from './CollectionAddTo';

export default {
  data() {
    return {
      article: new Article(),
    };
  },
  props: ['article_uid'],
  components: {
    BaseTitleBar,
    CollectionAddTo,
  },
  watch: {
    article_uid: {
      immediate: true,
      handler(val) {
        this.article = new Article();
        services.articles.get(val).then((res) => {
          this.article = new Article({
            ...res,
            regions: res.regions.map(region => ({
              ...region,
              iiifFragment: region.iiif_fragment,
            })),
          });
        });
      },
    },
  },
};
</script>

<style lang="less">
#IssueViewerText{
  overflow: none;
  height: 100%;

  span.location{
    border-bottom: 1px solid cyan;
  }

  .region{
    padding: 0.125rem 0.25rem;
    background: white;

    p {
      margin-bottom: 0;
    }
  }
}
</style>

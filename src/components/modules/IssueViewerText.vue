<template lang="html">
  <div id="IssueViewerText">
    <div v-for="article in page.articles" class="article p-2 border-bottom">
      <div class="regions">
        <div v-for="region in article.regions" class="region py-4">
          <div class="context">
            <img v-bind:src="region.iiifFragment" width="100%" />
          </div>
          <div class="richtext text-tertiary">
            <p v-for="line in region.g" v-html="line" class="mb-0"></p>
          </div>
        </div>
      </div>
      <div class="controls text-right">
        <h5>{{article.title}}</h5>
        <b-button-group>
          <b-button size="sm" variant="outline-primary">Add Tag ...</b-button>
        </b-button-group>
        <hr>
        <b-button size="sm" variant="outline-primary">Add to Collection ...</b-button><br>
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
      </div>
    </div>
  </div>
</template>

<script>
import BaseTitleBar from './../base/BaseTitleBar';

export default {
  model: {
    prop: 'page',
  },
  props: ['page'],
  components: {
    BaseTitleBar,
  },
};
</script>

<style scoped lang="less">
.article {
    display: grid;
    grid-template-columns: 1fr 220px;
    grid-template-rows: auto;
    grid-template-areas: 'regions controls';
    column-gap: 1rem;

    .regions {
      grid-area: regions;
    }

    .controls{
      grid-area: controls;
    }
}
.region {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: 'context richtext';
    column-gap: 2em;

    .context{
      grid-area: context;
    }

    .richtext {
      grid-area: richtext;
    }

}
</style>

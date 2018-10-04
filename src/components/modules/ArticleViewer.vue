<template lang="html">
  <div class="article m-2">
    <ul class="regions">

      <li v-for="region in article.regions" class="region py-4">
        <div class="page">
          <p class="text-tertiary">p. {{ region.pageUid.slice(-2) }}</p>
        </div>
        <div class="context">
          <img v-bind:src="region.iiif_fragment" width="100%" />
        </div>
        <div class="richtext text-tertiary">
          <p v-for="line in region.g" v-html="line" class="mb-0"></p>
        </div>
      </li>

    </ul>
    <div class="controls text-right">
      <h5>{{ article.title }}</h5>
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
      <hr>
      <pre>{{article}}</pre>
    </div>

  </div>
</template>

<script>
export default {
  model: {
    prop: 'article',
  },
  props: ['article'],
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
    grid-template-columns: 40px 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: 'page context richtext';
    column-gap: 2em;

    .page{
      grid-area: page;
    }

    .context{
      grid-area: context;
    }

    .richtext {
      grid-area: richtext;
    }

}
</style>

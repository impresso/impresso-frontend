<template lang="html">
  <div class="article m-2">
    <div class="regions">
      <div class="region">
        <div class="page">
          <p class="text-tertiary">p.
            <span v-if="typeof article.pages[0].num !== 'undefined'">{{article.pages[0].num}}</span>
          </p>
        </div>
        <div class="context">
          <img src="https://dummyimage.com/300x320/eee/ccc" width="100%" />
        </div>
        <div class="richtext">
          <h5 v-html="article.title"></h5>
          <p v-html="article.excerpt" class="text-tertiary"></p>
        </div>
      </div>

      <hr>

      <div class="region">
        <div class="page">
          <p class="text-tertiary">
            <span v-if="typeof article.pages[0].num !== 'undefined'">{{article.pages[0].num}}</span>
          </p>
        </div>
        <div class="context">
          <img src="https://dummyimage.com/300x420/eee/ccc" width="100%" />
        </div>
        <div class="richtext">
          <h5 v-html="article.title"></h5>
          <p v-html="article.excerpt" class="text-tertiary"></p>
        </div>
      </div>

      <hr>

    </div>

    <div class="controls text-right">
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
    grid-template-columns: 40px 1fr 2fr;
    grid-template-rows: auto;
    grid-template-areas: 'page context richtext';
    column-gap: 1rem;

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

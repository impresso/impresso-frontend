<template lang="html">
  <div class="tile my-3 border">
    <div
      class="thumbnail bg-light clearfix"
      :style="`background-image: url(${searchResult.regions[0].iiifFragment})`">
      <div v-if="isLoggedIn() && checkbox" class="float-right pt-1 pl-1">
        <b-checkbox
          class="m-0 select-item"
          v-bind:checked.native="checked"
          v-on:change="toggleSelected" />
      </div>
    </div>
    <a href="#" v-on:click.prevent="click" class="titleblock article-meta p-2 border-top">
      <h2>{{searchResult.uid}}</h2>
      <div v-show="searchResult.newspaper.name != ''" class="small-caps">
        {{searchResult.newspaper.name}}
      </div>
      <div class="small-caps">
        {{$d(new Date(searchResult.date), 'short')}}
        (p. <span>{{searchResult.pages.map(page => page.num).join('; ')}}</span>)
      </div>
    </a>
  </div>
</template>

<script>
export default {
  data: () => ({
  }),
  model: {
    prop: 'image',
  },
  props: ['searchResult', 'checkbox', 'checked'],
  methods: {
    click() {
      this.$emit('click');
    },
    toggleSelected() {
      this.$emit('toggleSelected');
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.tile {
  div.overlay-region{
    background: $clr-accent-secondary;
    opacity: 0.25;
  }
  &:hover {
    transition: 0.2s;
    border-color: black !important;
  }
  .titleblock {
    display:block;
    &:hover {
      text-decoration: none;
      border-color: black !important;
    }
  }
  .thumbnail {
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      height: 20em;
      height: 30vh;
      input[type="checkbox"] {
          width: 0;
      }
  }
  h2 {
    font-size: 1em;
    font-weight: 500;
  }
  overflow: hidden;
}

</style>

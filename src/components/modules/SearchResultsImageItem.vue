<template lang="html">
  <b-card class="search-results-image-item">
    <b-card-text>
      <b-checkbox v-if="enableCheckbox"
        class="m-0 select-item"
        v-bind:checked="isChecked"
        v-on:change="$emit('toggleSelected', item)" />
      <image-item
        fluid-grow
        :enableSimilarTo="enableSimilarTo"
        :item="item"
        show-meta
      />
    </b-card-text>
    <template v-slot:footer v-if="enableSimilarTo">
      <b-button variant="outline-primary" v-on:click="$emit('click:search', item)" class="buttonFindSimilar"
        size="sm">
        {{ $t('actions.getSimilarImages') }}
      </b-button>
    </template>
  </b-card>
</template>

<script>
import ImageItem from '@/components/modules/lists/ImageItem';

export default {
  components: {
    ImageItem,
  },
  props: {
    item: Object,
    enableCheckbox: Boolean,
    enableSimilarTo: Boolean,
    isChecked: Boolean,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.search-results-image-item{
  cursor: pointer;
  .card-body{
    padding: 0.25rem;
  }
  &:hover{
    border: 1px solid black;
  }
}

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
      position: relative;
      input[type="checkbox"] {
          width: 0;
      }
      .buttonFindSimilar{
        position: absolute;
        bottom:0;
        right:0;
      }
  }
  h2 {
    font-size: 1em;
    font-weight: 500;
  }
  overflow: hidden;
}

</style>

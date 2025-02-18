<template>
  <div class="card search-results-image-item mx-1">
    <div class="card-body">
      <p class="card-text">
        <b-checkbox
          v-if="enableCheckbox"
          class="m-0 select-item"
          v-bind:checked="isChecked"
          v-on:change="$emit('toggleSelected', item)"
        />
        <image-item fluid-grow :item="item" show-meta />
      </p>
    </div>
    <div v-if="enableSimilarTo" class="card-footer">
      <b-button
        variant="outline-primary"
        v-on:click="$emit('click:search', item)"
        class="buttonFindSimilar"
        size="sm"
      >
        {{ $t('actions.getSimilarImages') }}
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import ImageItem from '@/components/modules/lists/ImageItem.vue'
import { IImage } from '@/models'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  components: {
    ImageItem
  },
  props: {
    item: Object as PropType<IImage>,
    enableCheckbox: Boolean,
    enableSimilarTo: Boolean,
    isChecked: Boolean
  }
})
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

.search-results-image-item {
  cursor: pointer;
  .card-body {
    padding: 0.25rem;
  }
  &:hover {
    border: 1px solid black;
  }
}

.tile {
  div.overlay-region {
    background: $clr-accent-secondary;
    opacity: 0.25;
  }
  &:hover {
    transition: 0.2s;
    border-color: black !important;
  }
  .titleblock {
    display: block;
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
    input[type='checkbox'] {
      width: 0;
    }
    .buttonFindSimilar {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
  h2 {
    font-size: 1em;
    font-weight: 500;
  }
  overflow: hidden;
}
</style>

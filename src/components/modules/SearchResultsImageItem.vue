<template>
  <div class="SearchResultsImageItem card mx-1 rounded-md shadow-sm">
    <div class="card-body">
      <p class="card-text">
        <b-checkbox
          v-if="enableCheckbox"
          class="m-0 select-item"
          v-bind:checked="isChecked"
          v-on:change="$emit('toggleSelected', item)"
        />
        <image-item v-if="isImageAvailable" fluid-grow :item="item" show-meta :default-visibility="defaultVisibility" />
        <div v-else v-html="$t(messageKey)" class="p-3 my-3 text-center font-style-italic"></div>
      </p>
    </div>
    <div v-if="enableSimilarTo" class="card-footer p-2">
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

<script setup lang="ts">
import ImageItem from '@/components/modules/lists/ImageItem.vue'
import { PlanGuest } from '@/constants';
import { IImage } from '@/models'
import { computed } from 'vue'

const props = defineProps<{
  item: IImage
  enableCheckbox: boolean
  enableSimilarTo: boolean
  isChecked: boolean
  userPlan: string
  defaultVisibility?: boolean
}>()

const isImageAvailable = computed(() => {
  
  if(!props.item?.previewUrl) {
    return false
  }
  if (props.item.previewUrl === import.meta.env.VITE_IMG_NOT_ALLOWED_URL) {
    return false
  }
  return true
})
import { useI18n } from 'vue-i18n' // Add this import

const messageKey = computed(() => {
  if (!isImageAvailable.value) {
    if(props.userPlan === PlanGuest) {
      // please login
      return'label_login_message'
    }
    return 'label_not_available_to_your_plan'
  }
  return ''
})
</script>
<style scoped>

.SearchResultsImageItem {
  cursor: pointer;
}
.SearchResultsImageItem .card-body {
  padding: 0.25rem;
}
.SearchResultsImageItem:hover {
  border: 1px solid black;
}


.tile .overlay-region {
  background: var(--impresso-color-pastel-blue);
  opacity: 0.25;
}
.tile:hover {
  transition: 0.2s;
  border-color: black !important;
}
.tile .titleblock {
  display: block;
}
.tile .titleblock:hover {
  text-decoration: none;
  border-color: black !important;
}
.tile .thumbnail {
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  height: 30vh;
  position: relative;
}
.tile .thumbnail input[type='checkbox'] {
  width: 0;
}
.tile .thumbnail .buttonFindSimilar {
  position: absolute;
  bottom: 0;
  right: 0;
}
.tile h2 {
  font-size: 1em;
  font-weight: 500;
}
.tile {
  overflow: hidden;
}

</style>
<i18n lang="json">
{
  "en": {
    "actions": {
      "getSimilarImages": "Find similar images"
    },
    "label_login_message": "Login to view image",
    "label_not_available_to_your_plan": "Not available to your plan"
  }
}
</i18n>
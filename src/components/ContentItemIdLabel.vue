<template>
  <div class="rounded border px-2 small text-muted d-inline-block">
    {{ props.item.id }}
    <InfoButton
      style="margin-top: -2px"
      :default-content="$t('id_description')"
      :name="$t('id_text')"
    ></InfoButton>
  </div>
</template>
<script lang="ts" setup>
import type { ContentItem } from '@/models/generated/schemas/contentItem.d.ts'
import InfoButton from './base/InfoButton.vue'

export interface ContentItemIdLabelProps {
  item: ContentItem
}

const props = defineProps<ContentItemIdLabelProps>()
</script>
<i18n lang="json">
{
  "en": {
    "id_text": "Content Item ID",
    "id_description": "The Content Item ID is a unique identifier assigned to each content item in the Impresso system. It is used to reference and access specific content items within the database."
  }
}
</i18n>

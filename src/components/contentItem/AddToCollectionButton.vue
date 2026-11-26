<template>
  <CollectionAddTo
    v-if="props.contentItem"
    right
    :items="items"
    :text="$t('actions.addToCollection')"
  />
  <WithTooltip v-else :content="$t('selectItemFirst')">
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary"
      disabled
      :aria-description="$t('selectItemFirst')"
    >
      {{ $t('actions.addToCollection') }}
    </button>
  </WithTooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WithTooltip from '@/components/base/WithTooltip.vue'
import CollectionAddTo from '@/components/modules/CollectionAddTo.vue'
import type { ItemWithCollections } from '@/components/modules/CollectionAddToList.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'

const props = defineProps<{ contentItem: ContentItem | null }>()

const items = computed<ItemWithCollections[]>(() => {
  const item = props.contentItem
  if (!item) return []
  return [{ itemId: item.id, collectionIds: item.semanticEnrichments?.collections?.map(c => c.id) }]
})
</script>

<i18n lang="json">
{
  "en": {
    "selectItemFirst": "Select a content item to add it to a collection."
  }
}
</i18n>

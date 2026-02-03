<template>
  <InfoModal
    :isVisible="isVisible"
    :modalTitle="modalTitle"
    dialogClass="modal-dialog-scrollable modal-dialog-centered modal-lg"
    bodyClass="pt-0 pe-4 ps-2"
    @close="emit('dismiss')"
    @confirm="emit('confirm')"
    hide-footer
  >
    <h5 class="mt-3">{{ title }}</h5>
    <LoadingBlock v-if="isLoading" :height="300" />
    <b-tabs pills class="mx-2 pt-2 SourceOverviewModal__tabs">
      <template v-slot:tabs-end>
        <b-nav-item class="w-50" v-for="tab in tabs" :key="tab.name">
          <button
            size="sm"
            class="w-100 btn btn-transparent nav-link"
            :class="{ active: activeTab === tab.name }"
            @click="activeTab = tab.name"
          >
            {{ $t(tab.label) }} <Icon :name="tab.icon" class="ms-1" />
          </button>
        </b-nav-item>
      </template>
    </b-tabs>
    <div>
      <section v-if="activeTab === 'metadata'" class="p-2 pt-3">
        <div v-if="filters.length">
          <p v-html="$t('useCurrentFiltersToExploreSourcesOverview')" />
          <blockquote class="bg-light p-3 rounded border">
            <span>{{ $t('contentItems') }}</span>
            {{ ' ' }}
            <SearchQuerySummary :searchQuery="{ filters }" />
          </blockquote>
          <button
            class="btn btn-md border border-dark btn-outline-primary d-flex align-items-center mt-3 gap-2"
            @click="emit('dismiss')"
          >
            {{ $t('exploreSourcesOverview') }}
            <Icon name="arrowRight" />
          </button>
        </div>
      </section>
      <section v-else-if="activeTab === 'barista'" class="p-3">
        {{ $t('withBaristaDescription') }}
      </section>
    </div>
  </InfoModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import LoadingBlock from '../LoadingBlock.vue'
import InfoModal from '../InfoModal.vue'
import Icon from '../base/Icon.vue'
import type { Filter } from '@/models'
import SearchQuerySummary from '../modules/SearchQuerySummary.vue'

export type SourcesOverviewModalProps = {
  title?: string
  modalTitle?: string
  isVisible?: boolean
  requestDelay?: number
  filters?: Filter[]
}
withDefaults(defineProps<SourcesOverviewModalProps>(), {
  title: 'Sources Overview: welcome!',
  modalTitle: 'Sources Overview',
  requestDelay: 10,
  filters: () => []
})
const emit = defineEmits(['dismiss', 'confirm'])
const isLoading = ref(false)
const tabs = ref([
  { name: 'metadata', label: 'byMetadata', icon: '' },
  { name: 'barista', label: 'withBarista', icon: 'sparks' }
])
const activeTab = ref('metadata')
</script>
<style lang="css">
ul.SourceOverviewModal__tabs.nav.nav-pills .nav-item .nav-link {
  font-size: var(--impresso-font-size);
  font-variant: normal;
  letter-spacing: normal;
  font-weight: var(--impresso-wght);
  font-variation-settings: 'wght' var(--impresso-wght);
  text-transform: none;
}
ul.SourceOverviewModal__tabs.nav.nav-pills .nav-item .nav-link.active {
  font-weight: var(--impresso-wght-bold);
  font-variation-settings: 'wght' var(--impresso-wght-bold);
}
</style>
<i18n lang="json">
{
  "en": {
    "byMetadata": "By Metadata",
    "withBarista": "With Barista",
    "withBaristaDescription": "(Not there yet!) Explore the sources overview using Barista to refine or start your search query.",
    "useCurrentFiltersToExploreSourcesOverview": "You can use the current filters to explore the Sources Overview. The following <strong>content items</strong> are considered:",
    "exploreSourcesOverview": "Use current Filters to Explore Sources Overview"
  }
}
</i18n>

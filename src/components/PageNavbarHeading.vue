<template>
  <b-navbar
    type="light"
    variant="light"
    class="p-0 align-items-stretch justify-content-between border-bottom"
  >
    <b-navbar-nav class="px-3 py-2">
      <div>
        <slot name="label">
          <span class="label small-caps"> {{ label }} </span>
        </slot>
        <slot name="title">
          <h3 class="mb-1">{{ title }}</h3>
        </slot>
      </div>
    </b-navbar-nav>
    <b-navbar-nav
      v-if="!!$slots.actions"
      class="border-start border-left px-3 py-2 align-items-end"
    >
      <slot name="actions" />
    </b-navbar-nav>
  </b-navbar>
  <b-navbar
    v-if="!!$slots.summary || !!$slots.summaryActions"
    class="p-0 align-items-stretch justify-content-between border-bottom"
  >
    <b-navbar-nav v-if="!!$slots.summary" class="px-3 py-2 flex-grow-1">
      <slot name="summary" />
    </b-navbar-nav>
    <b-navbar-nav v-if="!!$slots.summaryActions" class="px-3 py-2 border-left align-items-end">
      <slot name="summaryActions" />
    </b-navbar-nav>
  </b-navbar>
</template>

<script setup lang="ts">
export interface PageNavbarHeadingProps {
  label?: string
  title?: string
}
withDefaults(defineProps<PageNavbarHeadingProps>(), {
  label: 'Label',
  title: 'Title'
})
</script>

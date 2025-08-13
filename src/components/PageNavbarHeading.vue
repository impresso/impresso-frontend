<template>
  <b-navbar
    type="light"
    variant="light"
    class="p-0 align-items-stretch justify-content-between border-bottom"
  >
    <b-navbar-nav class="py-2 px-3">
      <div>
        <slot name="label">
          <span class="label small-caps"> {{ label }} </span>
        </slot>
        <slot name="title">
          <h3 class="mb-1">{{ title }}</h3>
        </slot>
      </div>
    </b-navbar-nav>
    <b-navbar-nav v-if="!!$slots.actions" class="border-start border-left py-2 px-3">
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
    <b-navbar-nav v-if="!!$slots.summaryActions" class="px-3 p-y2 border-left">
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

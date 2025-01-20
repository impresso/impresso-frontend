<template>
  <a href="#" class="LinkToModal" @click="handleClick">
    <slot></slot>
  </a>
</template>
<script setup lang="ts">
import { Views } from '@/constants'
import { useViewsStore } from '@/stores/views'

const props = defineProps<{
  withCallToAction?: boolean
  view: (typeof Views)[number]
}>()

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
  useViewsStore().view = props.view
}
/**
 * A component that renders a link which, when clicked, triggers a modal view change.
 *
 *  Props:
 *    - withCallToAction (optional): A boolean indicating if the link should have a call to action.
 *    - view: A required view from the Views store that will be set when the link is clicked.
 *
 *  Slots:
 *    - default: Content to be rendered inside the link.
 *
 *  Events:
 *   - click: Prevents the default action and sets the view in the Views store.
 *
 * Handles the click event on the link.
 * Prevents the default action and sets the view in the Views store.
 *
 * @param {MouseEvent} event - The click event.
 */
</script>

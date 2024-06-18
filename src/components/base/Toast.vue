<template>
  <div class="p-1" :class="classes">
    <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true" data-delay="2000">
      <div class="toast-header">
        <!-- <img src="..." class="rounded mr-2" alt="..."> -->
        <strong class="mr-auto">{{  props.notification.title }}</strong>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close" @click="emit('close', props.notification.id)">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="toast-body">
        {{ props.notification.message }}
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import type { StoredNotification } from '@/stores/notifications'

const props = defineProps({
  notification: {
    type: Object as PropType<StoredNotification>,
    default: null,
  },
  placement: {
    type: String as PropType<'bottom-right'>,
    default: 'bottom-right',
  },
})
const emit = defineEmits(['close'])

const classes = computed(() => ({
  'bottom-0': props.placement === 'bottom-right',
  'right-0': props.placement === 'bottom-right',
  [`b-toast-${props.notification.type}`]: true,
}))

</script>

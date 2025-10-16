<template>
  <div
    class="Toast"
    :class="classes"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    data-delay="2000"
  >
    <div class="toast-header" v-if="props.notification.title.length">
      <!-- <img src="..." class="rounded mr-2" alt="..."> -->
      <strong class="mr-auto font-weight-bold small">{{ props.notification.title }}</strong>
    </div>
    <div class="toast-body small">
      {{ props.notification.message }}
    </div>
    <button
      type="button"
      class="Toast__button btn btn-close"
      data-dismiss="toast"
      v-if="props.showCloseButton"
      aria-label="Close"
      @click="emit('close', props.notification.id)"
    >
      <Icon name="cross" :stroke-width="2" :scale="0.75" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StoredNotification } from '@/stores/notifications'
import Icon from './Icon.vue'

export interface Props {
  notification: StoredNotification
  placement?: 'bottom-right'
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-right',
  showCloseButton: true
})

const emit = defineEmits(['close'])

const classes = computed(() => ({
  'bottom-0': props.placement === 'bottom-right',
  'right-0': props.placement === 'bottom-right',
  [props.notification.type]: true,
  'with-close-button': props.showCloseButton,
  'with-title': props.notification.title.length > 0
}))
</script>
<style lang="css">
.Toast {
  border: 0px solid transparent !important;
  border-radius: var(--impresso-border-radius-xs);
  box-shadow: var(--bs-box-shadow-md);
  background-color: var(--impresso-color-black-alpha-50);
  color: var(--impresso-color-black-deeper);
  padding: 10px 20px;
  display: inline-block;
  position: relative;
}

.Toast.with-close-button {
  padding-right: 50px;
}

.Toast.info {
  --info: var(--impresso-color-black-deeper);
  --bs-box-shadow-md:
    rgba(49, 164, 207, 0.25) 0px 0.0625em 0.0625em, rgba(49, 164, 207, 0.25) 0px 0.125em 0.5em,
    rgba(209, 236, 241, 0.1) 0px 0px 0px 1px inset;
  color: var(--impresso-color-white);
  background-color: var(--info);
}
.Toast.info.toast-header,
.Toast.info.toast-body,
.Toast.info .Toast__button {
  color: white;
}

.Toast.success {
  --bs-box-shadow-md:
    rgba(102, 187, 106, 0.25) 0px 0.0625em 0.0625em, rgba(102, 187, 106, 0.25) 0px 0.125em 0.5em,
    rgba(200, 230, 201, 0.1) 0px 0px 0px 1px inset;
  background-color: var(--success);
}
.Toast.success.toast-header,
.Toast.success.toast-body {
  background-color: var(--success);
  color: var(--impresso-color-black-deeper);
}
.Toast__button {
  position: absolute;
  top: 0px;
  right: 0px;
}
</style>

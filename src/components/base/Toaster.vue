<template>
  <div class="position-fixed" style="z-index: 10000; right: 0; bottom: 0;">
    <Toast
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>


<script setup lang="ts">
import Toast from '@/components/base/Toast.vue'
import store from '@/store'
import { toRef, watch } from 'vue'

const removeNotification = (id: string) => store.dispatch('notifications/removeNotification', id)
const notifications = toRef(store.state['notifications'], 'notifications')

watch(notifications, v => {
  console.log('*** notifications changed ***', v)
}, { immediate: true })

</script>

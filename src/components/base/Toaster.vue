<template>
  <div class="position-fixed" style="z-index: 10000; right: 0; bottom: 0;">
    <Toast
      v-for="notification in store.notifications"
      :key="notification.id"
      :notification="notification"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>


<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import Toast from '@/components/base/Toast.vue'

const store = useNotificationsStore()

const removeNotification = (id: string) => store.removeNotification(id)

</script>

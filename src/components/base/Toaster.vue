<template>
  <div
    class="Toaster position-fixed"
    style="z-index: 10000; left: 50%; transform: translateX(-50%); bottom: var(--spacing-5)"
  >
    <TransitionGroup name="list" tag="div" class="d-flex gap-2 flex-column align-items-center">
      <Toast
        v-for="notification in store.notifications"
        :key="notification.id"
        :notification="notification"
        @close="removeNotification(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import Toast from '@/components/base/Toast.vue'

const store = useNotificationsStore()

const removeNotification = (id: string) => store.removeNotification(id)
</script>
<style lang="css">
.Toaster .list-move {
  transition: transform 0.5s;
}
.Toaster .list-enter-active,
.Toaster .list-leave-active {
  transition: all 0.5s ease;
}

.Toaster .list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.Toaster .list-leave-to {
  opacity: 0;
}
</style>

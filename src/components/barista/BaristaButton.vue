<template>
  <div class="barista-button-container">
    <!-- Floating button -->
    <button
      class="barista-button"
      @click="toggleChat"
      :class="{ active: isChatOpen }"
      aria-label="Toggle Barista Chat"
    >
      <span class="barista-icon">☕</span>
      <span class="barista-label">Chat with Barista</span>
    </button>

    <!-- Chat popup -->
    <Transition name="fade">
      <div v-if="isChatOpen" class="barista-popup" ref="chatPopup">
        <div class="barista-popup-header">
          <h3>Impresso Barista</h3>
          <button class="close-button" @click="closeChat" aria-label="Close chat">
            <span class="dripicons-cross"></span>
          </button>
        </div>
        <div class="barista-popup-content">
          <BaristaChat @search="handleSearch" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaristaChat from './BaristaChat.vue'

const isChatOpen = ref(false)
const chatPopup = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  search: [filters: string]
}>()

// Toggle chat visibility
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}

// Close chat
const closeChat = () => {
  isChatOpen.value = false
}

// Handle search action from BaristaChat
const handleSearch = (searchFilters: string) => {
  // Emit the search event so parent components can listen
  emit('search', searchFilters)
}

// Close chat when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    isChatOpen.value &&
    chatPopup.value &&
    !chatPopup.value.contains(event.target as Node) &&
    !(event.target as Element).closest('.barista-button')
  ) {
    closeChat()
  }
}

// Close chat when pressing escape
const handleKeyDown = (event: KeyboardEvent) => {
  if (isChatOpen.value && event.key === 'Escape') {
    closeChat()
  }
}

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
.barista-button-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1050; // Higher than most content but below modal overlays
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.barista-button {
  display: flex;
  align-items: center;
  background-color: var(--impresso-color-black);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--clr-grey-800);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.active {
    background-color: var(--clr-accent);
  }

  .barista-icon {
    font-size: 20px;
    margin-right: 8px;
  }

  .barista-label {
    font-weight: var(--impresso-wght-medium);
    font-variation-settings: 'wght' var(--impresso-wght-medium);
  }
}

.barista-popup {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 400px;
  height: 500px;
  background-color: white;
  border-radius: var(--impresso-border-radius-md);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--clr-grey-300);

  @media (max-width: 480px) {
    width: 90vw;
    height: 70vh;
    right: -10px;
  }

  .barista-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--clr-accent-light);
    border-bottom: 1px solid var(--clr-grey-300);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: var (--impresso-wght-medium);
      font-variation-settings: 'wght' var(--impresso-wght-medium);
    }

    .close-button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      color: var(--impresso-color-black);

      &:hover {
        color: var(--clr-accent);
      }
    }
  }

  .barista-popup-content {
    flex: 1;
    overflow: hidden;
  }
}

// Transition effects
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

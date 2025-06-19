<template>
  <div
    class="issue-viewer-bookmarker d-flex align-items-center justify-content-center"
    :class="{ active, visible }"
  >
    <div
      class="bg-dark p-2 drop-shadow d-flex align-items-center justify-content-center"
      style="background: black !important"
    >
      <div class="mr-2">
        {{ $t('label_selected_article') }}
      </div>
      <div class="text-white font-weight-bold mr-2 text-ellipsis">
        {{ title }}
      </div>
      <button
        class="btn btn-sm btn-online-primary border border-white mx-2 text-white d-flex align-items-center"
        @click="emit('click-full-text')"
      >
        <span>
          {{ $t('closeReadingView') }}
        </span>
        <Icon name="textBox" class="ml-1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Icon from './base/Icon.vue'

export interface Props {
  article?: { uid?: string; title?: string }
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click-full-text'): void
  (e: 'remove-selection'): void
}>()

const active = ref(false)
const title = ref('')
const timeoutId = ref<number | undefined>()
const articleId = computed(() => props.article?.uid)

function show(delay = 600) {
  if (!articleId.value) return
  // Clear previous timeout if any
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  timeoutId.value = window.setTimeout(() => {
    active.value = true
    title.value = props.article?.title || ''
    timeoutId.value = undefined
  }, delay)
}

watch(articleId, uid => {
  active.value = false
  if (uid && props.visible) show()
})
watch(
  () => props.visible,
  visible => {
    if (visible) {
      show()
    } else {
      active.value = false
      if (timeoutId.value) {
        clearTimeout(timeoutId.value)
        timeoutId.value = undefined
      }
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "label_selected_article": "Selected:",
    "closeReadingView": "Read Transcript"
  }
}
</i18n>
<style lang="scss" scoped>
.issue-viewer-bookmarker {
  position: absolute;
  left: 50%;
  z-index: 2;
  width: 50%;
  margin-left: -25%;
  top: 0px;
  color: white;
  height: 70px;
  overflow: hidden;
  display: none;
  z-index: 100;

  & > div {
    background: #343b3f;
    border-radius: 5px;
    position: absolute;
    top: 10px;
    padding: 5px 50px;
    transform: translateY(-70px);
    transition: transform 0.6s cubic-bezier(0.8, -0.5, 0.2, 1.4);
  }

  &.active > div {
    transform: translateY(0);
  }

  &.visible {
    display: flex;
  }
}
</style>

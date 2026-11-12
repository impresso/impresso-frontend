<template>
  <div :class="status" class="MarkdownContent" v-html="content" />
  <LoadingBlock v-if="status === 'pending' || status === 'idle'" style="height: 100px" />
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, watch } from 'vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import { marked } from 'marked'

const props = defineProps<{
  url?: string
  markdown?: string
}>()

const content = ref('')
const status = ref<'idle' | 'success' | 'pending' | 'error'>('idle')

const loadContent = async (
  url: string | undefined,
  markdown: string | undefined,
  isCurrent: () => boolean
) => {
  if (markdown === undefined && !url) {
    console.debug('[MarkdownContent] URL is not set. Skipping loading content.')
    return
  }
  try {
    status.value = 'pending'
    let data: string
    if (markdown !== undefined) {
      data = markdown
    } else if (url) {
      console.debug('[MarkdownContent] loading content from URL:', url)
      const response = await axios.get<string>(url)
      console.info('[MarkdownContent]loading content from URL:', url, 'success')
      data = response.data.replace(/^---[\s\S]*?---\n/, '')
    } else {
      return
    }
    const rendered = await marked.parse(data)
    if (isCurrent()) {
      content.value = rendered
      status.value = 'success'
    }
  } catch (error) {
    console.error('Failed to load content from GitHub:', error)
    if (isCurrent()) {
      status.value = 'error'
    }
  }
}

watch(
  [() => props.url, () => props.markdown],
  ([url, markdown], _previous, onCleanup) => {
    let current = true
    onCleanup(() => {
      current = false
    })
    void loadContent(url, markdown, () => current)
  },
  { immediate: true }
)
</script>

<template>
  <div :class="status" class="MarkdownContent" v-html="content" />
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, watch } from 'vue'
import markdown from '@/filters/markdown'

const props = defineProps<{
  url?: string
}>()

const content = ref('')
const status = ref<'idle' | 'success' | 'pending' | 'error'>('idle')

const loadContent = async () => {
  console.debug('[MarkdownContent] loading content from URL:', props.url)
  if (!props.url) {
    console.debug('[MarkdownContent] URL is not set. Skipping loading content.')
    return
  }
  try {
    status.value = 'pending'
    const response = await axios.get(props.url)
    console.info('[MarkdownContent]loading content from URL:', props.url, 'success')
    let data = response.data
    // remove front matter
    const frontMatterRegex = /^---[\s\S]*?---\n/
    data = data.replace(frontMatterRegex, '')
    content.value = markdown(data)
    status.value = 'success'
    // get metadata values from frontMatter
    // title.value = response.data.match(/---\ntitle:\s?(.*)/)?.[1] || 'Terms oooOf Use'
  } catch (error) {
    console.error('Failed to load content from GitHub:', error)
    status.value = 'error'
  }
}

watch(() => props.url, loadContent, { immediate: true })
</script>

<template>
  <div v-if="errorMessages.length" class="alert alert-danger" role="alert">
    <ul class="list-unstyled m-0">
      <li v-for="(d, index) in errorMessages" :key="index">
        <b>{{ d.label ?? d.key }}</b
        >:&nbsp;{{ d.message }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { BadRequest, NotAuthenticated, type FeathersError } from '@feathersjs/errors'

/**
 * Type definitions for BadRequestData
 */
export type BadRequestData = { key?: string; message: string; label?: string }

/**
 * Props definition for ErrorManager component
 */
const props = defineProps<{
  error?: FeathersError | BadRequest | Error | null
}>()

/**
 * Computed property to process error messages
 */
const errorMessages = computed<BadRequestData[]>(() => {
  if (props.error instanceof BadRequest) {
    return Object.keys(props.error.data).map(key => ({
      key,
      message: props.error.data[key].message,
      label: props.error.data[key].label
    }))
  } else if (props.error instanceof NotAuthenticated) {
    return [{ key: 'Error', message: props.error.message }]
  } else if (props.error instanceof Error) {
    return [{ key: 'Error', message: props.error.message }]
  }
  return []
})
</script>

<style scoped>
.alert {
  padding: 1rem;
}
</style>

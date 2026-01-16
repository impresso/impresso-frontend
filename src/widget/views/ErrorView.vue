<template>
  <div class="error-page">
    <h1>{{ errorTitle }}</h1>
    <p>{{ errorMessage }}</p>
    <button @click="goHome">Go to Home</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  errorType: {
    type: String,
    default: 'unknown'
  },
  message: {
    type: String,
    default: ''
  }
})

const router = useRouter()

const errorTitle = computed(() => {
  const titles = {
    validation: 'Invalid Parameters',
    404: 'Page Not Found',
    unknown: 'An Error Occurred'
  }
  return titles[props.errorType] || titles.unknown
})

const errorMessage = computed(() => {
  return props.message || 'Something went wrong. Please try again.'
})

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 0px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>

<template>
  <Modal
    :show="isVisible"
    title="Terms Of Use"
    modalClasses="TermsOfUseModal"
    dialogClass="modal-dialog-scrollable modal-xl"
    @close="cancel"
    @ok="confirm"
  >
    >
    <p>{{ props.message }}</p>
    <div v-html="content" />
  </Modal>
</template>

<script setup lang="ts">
import axios from 'axios'
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import { useViewsStore, ViewTermsOfUse } from '@/stores/views'
import Modal from './base/Modal.vue'
import { watch } from 'vue'
import markdown from '@/filters/markdown'

const store = useViewsStore()
const isVisible = ref(store.view === ViewTermsOfUse)
const content = ref('')

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

watch(
  () => store.view,
  newView => {
    console.debug('[TermsOfUseModal] view changed', newView)
    isVisible.value = newView === ViewTermsOfUse
  }
)
const emit = defineEmits(['confirm', 'cancel'])

const confirm = () => {
  emit('confirm')
  store.view = null
}

const cancel = () => {
  emit('cancel')
  store.view = null
}

onMounted(async () => {
  console.info('[TermsOfUseModal] loading content from GitHub...')
  try {
    const response = await axios.get(import.meta.env.VITE_TERMS_OF_USE_MD_URL)
    console.info('[TermsOfuseModal] response:', response)
    content.value = markdown(response.data)
  } catch (error) {
    console.error('Failed to load content from GitHub:', error)
  }
})
</script>

<style>
.TermsOfUseModal h2,
.TermsOfUseModal h3 {
  font-size: inherit;
}
/* .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
} */

/* button {
  margin: 5px;
} */
</style>

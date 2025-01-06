<template>
  <Modal
    :show="isVisible"
    title="Terms Of Use"
    modalClasses="TermsOfUseModal"
    :dialogClass="props.dialogClass"
    @close="cancel"
  >
    <h1>{{ title }}</h1>
    <Alert type="warning" class="bg-info" style="position: sticky; top: 0">
      <TermsOfUseStatus />
    </Alert>
    <div class="my-2" v-html="content" />
    <AcceptTermsOfUse />
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="cancel">
        hide for this session
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import axios from 'axios'
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import { useViewsStore, ViewTermsOfUse } from '@/stores/views'
import Modal from './base/Modal.vue'
import { watch } from 'vue'
import markdown from '@/filters/markdown'
import Alert from './Alert.vue'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'

const store = useViewsStore()
const isVisible = ref(store.view === ViewTermsOfUse)

const content = ref('')
const title = ref('Title')
const props = defineProps({
  dialogClass: {
    type: String,
    default: 'modal-dialog-scrollable modal-lg'
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
    console.info('[TermsOfUseModal] response:', response)
    let data = response.data
    const frontMatterRegex = /^---[\s\S]*?---\n/

    data = data.replace(frontMatterRegex, '')
    // get title value from frontMatter
    title.value = response.data.match(/---\ntitle:\s?(.*)/)?.[1] || 'Terms oooOf Use'
    content.value = markdown(data)
  } catch (error) {
    console.error('Failed to load content from GitHub:', error)
  }
})
</script>

<style>
.TermsOfUseModal {
  z-index: 1002;
}
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

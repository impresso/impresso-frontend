<template>
  <span class="nav-item d-flex align-items-center">
    <button
      class="nav-link btn btn-link d-flex align-items-center gap-1 px-2"
      :title="$t('label')"
      @click="toggleModal"
    >
      <div class="d-inline-block dripicons-cloud-download position-relative" style="top: 0.15em" />
      <span class="ms-1">{{ $t('label') }}</span>
      <transition name="bounce">
        <span
          v-if="runningJobs.length > 0"
          class="badge rounded-pill bg-danger border ms-1"
        >
          {{ runningJobs.length }}
        </span>
      </transition>
    </button>
    <Teleport to="body">
      <JobsModal
        :isVisible="isModalOpen"
        @dismiss="closeModal"
      />
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import { useUserStore } from '@/stores/user'
import JobsModal from './JobsModal.vue'

const jobsStore = useJobsStore()
const userStore = useUserStore()

const isModalOpen = ref(false)

const runningJobs = computed(() => jobsStore.items.filter(d => d.status === 'RUN'))

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value
}

const closeModal = () => {
  isModalOpen.value = false
}

function loadJobsIfLoggedIn() {
  if (userStore.user) {
    jobsStore.loadJobs({ page: 1, limit: 10 })
  }
}

onMounted(() => {
  loadJobsIfLoggedIn()
})

watch(
  () => userStore.user,
  (user) => {
    if (user) {
      jobsStore.loadJobs({ page: 1, limit: 10 })
    }
  }
)
</script>

<i18n lang="json">
{
  "en": {
    "label": "Jobs"
  }
}
</i18n>

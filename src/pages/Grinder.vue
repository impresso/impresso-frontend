<template>
  <div class="container my-5 GrinderPage">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-3">{{ $t('grinder.title') }}</h1>
        <p class="text-muted">{{ $t('grinder.subtitle') }}</p>
      </div>
      <div class="col-12">
        <LoadingBlock v-if="isLoading" :height="120" />
        <Alert v-else-if="noAccess" type="warning" class="mb-3">
          {{ $t('grinder.noAccess') }}
        </Alert>
        <Alert v-else-if="errorMessage" type="error" class="mb-3">
          {{ errorMessage }}
        </Alert>
        <div v-else>
          <div class="mb-4">
            <h2 class="h5 mb-3">{{ $t('grinder.cacheTitle') }}</h2>
            <table class="table table-sm table-bordered GrinderPage__table">
              <tbody>
                <tr class="table-light">
                  <th class="text-uppercase small" :colspan="cacheColumns.length || 1">
                    {{ $t('grinder.cacheCounts') }}
                  </th>
                </tr>
                <tr v-if="cacheColumns.length > 0" class="small text-muted">
                  <th v-for="column in cacheColumns" :key="column">{{ column }}</th>
                </tr>
                <tr v-if="cacheColumns.length > 0">
                  <td v-for="column in cacheColumns" :key="column">
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <span>{{ formatCellValue(cacheCounts[column]) }}</span>
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        type="button"
                        :disabled="actionInFlight !== null"
                        @click="clearCache(column)"
                      >
                        {{ $t('grinder.clear') }}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="cacheColumns.length === 0">
                  <td class="text-muted">{{ $t('grinder.noEntries') }}</td>
                </tr>
                <tr class="table-light">
                  <th class="text-uppercase small" :colspan="wellKnownColumns.length || 1">
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <span>{{ $t('grinder.wellKnownComputedAt') }}</span>
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        type="button"
                        :disabled="actionInFlight !== null"
                        @click="rebuildWellKnown"
                      >
                        {{ $t('grinder.clear') }}
                      </button>
                    </div>
                  </th>
                </tr>
                <tr v-if="wellKnownColumns.length > 0" class="small text-muted">
                  <th v-for="column in wellKnownColumns" :key="column">{{ column }}</th>
                </tr>
                <tr v-if="wellKnownColumns.length > 0">
                  <td v-for="column in wellKnownColumns" :key="column">
                    {{ formatCellValue(wellKnownComputedAt[column]) }}
                  </td>
                </tr>
                <tr v-if="wellKnownColumns.length === 0">
                  <td class="text-muted">{{ $t('grinder.noEntries') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row g-4">
            <div class="col-12">
              <h2 class="h5 mb-3">{{ $t('grinder.contentItemsTitle') }}</h2>
              <table class="table table-sm table-bordered GrinderPage__table">
                <tbody>
                  <template v-for="group in contentItemsGroups" :key="group.scope">
                    <tr class="table-light">
                      <th class="text-uppercase small" :colspan="group.columns.length || 1">
                        {{ group.scope }}
                      </th>
                    </tr>
                    <tr v-if="group.columns.length > 0" class="small text-muted">
                      <th v-for="column in group.columns" :key="column">{{ column }}</th>
                    </tr>
                    <tr v-for="(row, rowIndex) in group.rows" :key="rowIndex">
                      <td v-for="column in group.columns" :key="column" class="text-break">
                        <pre v-if="column === 'sample'" class="mb-0">
<code>{{ formatSampleValue(row[column]) }}</code>
                        </pre>
                        <code
                          v-else-if="isCodeColumn(column)"
                          :class="{ 'text-nowrap': column === 'bitmapStringBin' }"
                        >
                          {{ formatCellValue(row[column]) }}
                        </code>
                        <template v-else>{{ formatCellValue(row[column]) }}</template>
                      </td>
                    </tr>
                    <tr v-if="group.rows.length === 0">
                      <td :colspan="group.columns.length || 1" class="text-muted">
                        {{ $t('grinder.noEntries') }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <div class="col-12">
              <h2 class="h5 mb-3">{{ $t('grinder.imagesTitle') }}</h2>
              <table class="table table-sm table-bordered GrinderPage__table">
                <tbody>
                  <template v-for="group in imagesGroups" :key="group.scope">
                    <tr class="table-light">
                      <th class="text-uppercase small" :colspan="group.columns.length || 1">
                        {{ group.scope }}
                      </th>
                    </tr>
                    <tr v-if="group.columns.length > 0" class="small text-muted">
                      <th v-for="column in group.columns" :key="column">{{ column }}</th>
                    </tr>
                    <tr v-for="(row, rowIndex) in group.rows" :key="rowIndex">
                      <td v-for="column in group.columns" :key="column" class="text-break">
                        <pre v-if="column === 'sample'" class="mb-0">
<code>{{ formatSampleValue(row[column]) }}</code>
                        </pre>
                        <code
                          v-else-if="isCodeColumn(column)"
                          :class="{ 'text-nowrap': column === 'bitmapStringBin' }"
                        >
                          {{ formatCellValue(row[column]) }}
                        </code>
                        <template v-else>{{ formatCellValue(row[column]) }}</template>
                      </td>
                    </tr>
                    <tr v-if="group.rows.length === 0">
                      <td :colspan="group.columns.length || 1" class="text-muted">
                        {{ $t('grinder.noEntries') }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
          <details class="mt-4">
            <summary class="small text-muted">{{ $t('grinder.rawPayload') }}</summary>
            <pre class="bg-light border rounded p-3 small mb-0 GrinderPage__payload">{{
              formattedAdminData
            }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeathersError } from '@feathersjs/errors'
import Alert from 'impresso-ui-components/components/Alert.vue'
import { computed, onMounted, ref } from 'vue'
import { admin as adminService } from '@/services'
import LoadingBlock from '@/components/LoadingBlock.vue'
import type { Admin } from '@/models/generated/schemasPublic'
import { useNotificationsStore } from '@/stores/notifications'

const isLoading = ref(false)
const adminData = ref<Admin | null>(null)
const errorMessage = ref<string | null>(null)
const noAccess = ref(false)
const actionInFlight = ref<string | null>(null)
const notificationsStore = useNotificationsStore()

const formattedAdminData = computed(() =>
  adminData.value ? JSON.stringify(adminData.value, null, 2) : ''
)

type GroupedItems = {
  scope: string
  columns: string[]
  rows: Record<string, unknown>[]
}

const cacheCounts = computed<Record<string, unknown>>(
  () => adminData.value?.cacheCounts ?? {}
)
const cacheColumns = computed<string[]>(() => Object.keys(cacheCounts.value))
const wellKnownComputedAt = computed<Record<string, unknown>>(
  () => adminData.value?.wellKnownComputedAt ?? {}
)
const wellKnownColumns = computed<string[]>(() => Object.keys(wellKnownComputedAt.value))

const contentItemsGroups = computed<GroupedItems[]>(() =>
  buildPermissionGroups(adminData.value?.contentItemsPermissionsDetails)
)

const imagesGroups = computed<GroupedItems[]>(() =>
  buildPermissionGroups(adminData.value?.imagesPermissionsDetails)
)

function buildPermissionGroups(details: unknown): GroupedItems[] {
  if (!details || typeof details !== 'object') {
    return []
  }
  const topLevel = details as { permissions?: unknown }
  if (!Array.isArray(topLevel.permissions)) {
    return []
  }
  return topLevel.permissions
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const group = item as { scope?: string; permissions?: unknown }
      const rows = extractNestedPermissions(group.permissions)
      const columns = collectColumns(rows)
      return {
        scope: group.scope ?? 'unknown',
        columns,
        rows
      }
    })
}

function extractNestedPermissions(values: unknown): Record<string, unknown>[] {
  if (!Array.isArray(values)) {
    return []
  }
  return values.filter(item => item && typeof item === 'object') as Record<string, unknown>[]
}

function collectColumns(rows: Record<string, unknown>[]): string[] {
  const excludedColumns = new Set(['scope', 'permissions'])
  const columns = new Set<string>()
  rows.forEach(row => {
    Object.keys(row).forEach(key => {
      if (!excludedColumns.has(key)) {
        columns.add(key)
      }
    })
  })
  return Array.from(columns)
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

function isCodeColumn(column: string): boolean {
  return column === 'bitmapStringBin' || column === 'sample'
}

function formatSampleValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

async function fetchAdminData(): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  noAccess.value = false
  try {
    adminData.value = await adminService.find()
  } catch (error) {
    const err = error as FeathersError
    if (
      err?.code === 401 ||
      err?.code === 403 ||
      err?.name === 'NotAuthenticated' ||
      err?.name === 'Forbidden'
    ) {
      noAccess.value = true
    } else {
      errorMessage.value = err?.message ?? 'Failed to load admin data.'
    }
  } finally {
    isLoading.value = false
  }
}

async function runAdminAction(action: 'clear-db-cache' | 'clear-solr-cache' | 'clear-wikidata-cache' | 'rebuild-well-known-cache'): Promise<void> {
  actionInFlight.value = action
  errorMessage.value = null
  try {
    await adminService.patch(null, { action })
    await fetchAdminData()
    notificationsStore.addNotification({
      type: 'success',
      title: 'Admin action completed',
      message: 'The cache action finished and data has been refreshed.'
    })
  } catch (error) {
    const err = error as FeathersError
    errorMessage.value = err?.message ?? 'Failed to run admin action.'
  } finally {
    actionInFlight.value = null
  }
}

function clearCache(column: string): void {
  if (column === 'db') {
    void runAdminAction('clear-db-cache')
  } else if (column === 'solr') {
    void runAdminAction('clear-solr-cache')
  } else if (column === 'wikidata') {
    void runAdminAction('clear-wikidata-cache')
  }
}

function rebuildWellKnown(): void {
  void runAdminAction('rebuild-well-known-cache')
}

onMounted(() => {
  fetchAdminData()
})
</script>

<i18n lang="json">
{
  "en": {
    "grinder": {
      "title": "Grinder",
      "subtitle": "Administrative overview for cache status and maintenance tasks.",
      "contentItemsTitle": "Content items permissions",
      "imagesTitle": "Images permissions",
      "cacheTitle": "Cache status",
      "cacheCounts": "Cache counts",
      "wellKnownComputedAt": "Well-known computed at",
      "clear": "Clear",
      "noEntries": "No entries found for this scope.",
      "rawPayload": "Show raw payload",
      "noAccess": "You do not have access to this page."
    }
  }
}
</i18n>

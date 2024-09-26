<template>
  <div class="TextReuseClusterMonitor d-flex flex-column" v-if="totalPassages > 0">
    <div class="flex-shrink-1">
      <!-- add pagination for startPassage and endPassage -->
      <div class="d-flex flex-row p-3">
        <div class="w-50">
          <i-dropdown
            v-model="startPassageOrderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`)
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
          <Pagination
            size="sm"
            :totalRows="totalPassages"
            :perPage="1"
            :currentPage="startPassageOffset + 1"
            @change="handleStartPassageOffsetChange"
            class="d-flex justify-content-center"
          />
        </div>
        <div class="w-50">
          <i-dropdown
            v-model="endPassageOrderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`)
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
          <Pagination
            size="sm"
            :totalRows="totalPassages"
            :perPage="1"
            :currentPage="endPassageOffset + 1"
            @change="handleEndPassageOffsetChange"
            class="d-flex justify-content-center"
          />
        </div>
      </div>
      <div class="d-flex flex-row TextReuseClusterMonitor_header">
        <TextReusePassageItemLabel
          v-if="startPassage"
          :item="startPassage"
          class="py-2 mx-3 border-bottom"
        />
        <TextReusePassageItemLabel
          v-if="endPassage"
          :item="endPassage"
          class="py-2 mx-3 border-bottom"
        />
      </div>
    </div>
    <div class="position-relative flex-grow-1 mb-1">
      <div class="left w-50 position-absolute h-100">
        <p class="p-3" v-if="diff.length">
          <span v-for="(part, index) in diff" :key="index">
            <span v-if="part.added" class="added">{{ part.value }}</span>
            <span v-else-if="part.removed" class="removed">{{ part.value }}</span>
            <span v-else-if="part.value">{{ part.value }}</span>
          </span>
        </p>
        <p class="p-3" v-else-if="startPassage">
          {{ startPassage.content }}
        </p>
      </div>
      <div class="right w-50 position-absolute h-100">
        <p class="p-3">
          <span v-for="(part, index) in diff" :key="index">
            <span v-if="part.added" class="added">{{ part.value }}</span>
            <span v-else-if="part.removed" class="removed">{{ part.value }}</span>
            <span v-else-if="part.value">{{ part.value }}</span>
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import { diffChars } from 'diff'
import { textReusePassages } from '@/services'
import TextReusePassage from '@/models/TextReusePassage'
import TextReusePassageItemLabel from './modules/lists/TextReusePassageItemLabel.vue'
import { optimizeFilters } from '@/logic/filters'
import Pagination from '@/components/modules/Pagination.vue'
// onmounted load the first 2 text reuse passages from textreusepassage endpoint

const OrderByOptions = ['date', '-date', 'size', '-size']

export default {
  name: 'TextReuseClusterMonitor',
  components: {
    TextReusePassageItemLabel,
    Pagination
  },
  props: {
    // item is a textReuseCluster item
    item: {
      type: Object,
      required: true
    },
    filters: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    totalPassages: -1,

    startPassage: null,
    endPassage: null,

    startPassageOrderBy: 'date',
    endPassageOrderBy: '-date',

    startPassageOffset: 0,
    endPassageOffset: 0,

    startPassageIsLoading: false,
    endPassageIsLoading: false,

    isLoading: false,
    orderByOptions: OrderByOptions
  }),

  methods: {
    handleStartPassageOffsetChange(offset) {
      this.startPassageOffset = offset - 1
    },
    handleEndPassageOffsetChange(offset) {
      this.endPassageOffset = offset - 1
    },
    async loadStartPassage({ query }) {
      this.startPassageIsLoading = true
      this.startPassage = await textReusePassages
        .find({ query })
        .then(res => {
          this.totalPassages = res.total
          return res.data.length ? new TextReusePassage(res.data[0]) : null
        })
        .catch(err => {
          console.error('[TextReuseClusterMonitor] loadPassages', err)
          return null
        })
      this.startPassageIsLoading = false
    },
    async loadEndPassage({ query }) {
      this.endPassageIsLoading = true
      this.endPassage = await textReusePassages
        .find({ query })
        .then(res => {
          this.totalPassages = res.total
          return res.data.length ? new TextReusePassage(res.data[0]) : null
        })
        .catch(err => {
          console.error('[TextReuseClusterMonitor] loadPassages', err)
          return null
        })
      this.endPassageIsLoading = false
    }
  },
  computed: {
    diff() {
      if (this.startPassage && this.endPassage) {
        return diffChars(this.startPassage.content, this.endPassage.content)
      }
      return []
    },
    searchApiStartPassageQueryParameters() {
      const query = {
        offset: this.startPassageOffset,
        limit: 1,
        order_by: this.startPassageOrderBy,
        filters: this.filters.length
          ? optimizeFilters(this.filters)
          : [{ type: 'textReuseCluster', q: this.item.id }],
        addons: { newspaper: 'text' }
      }
      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    },
    searchApiEndPassageQueryParameters() {
      const filters = this.filters.length
        ? optimizeFilters(this.filters)
        : [{ type: 'textReuseCluster', q: this.item.id }]

      if (this.startPassage) {
        filters.push({ type: 'textReusePassage', context: 'exclude', q: this.startPassage.id })
      }

      const query = {
        offset: this.endPassageOffset,
        limit: 1,
        order_by: this.endPassageOrderBy,
        filters,
        addons: { newspaper: 'text' }
      }
      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    }
  },
  watch: {
    searchApiStartPassageQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug(
          '[TextReuseClusterMonitor] @searchApiStartPassageQueryParameters \n query:',
          query
        )
        await this.loadStartPassage({ query })
      },
      immediate: true
    },
    searchApiEndPassageQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug(
          '[TextReuseClusterMonitor] @searchApiEndPassageQueryParameters \n query:',
          query
        )
        await this.loadEndPassage({ query })
      },
      immediate: true
    }
  }
}
</script>

<style lang="css">
.TextReuseClusterMonitor_header > div {
  flex: 1 1 0px;
}

.TextReuseClusterMonitor .left,
.TextReuseClusterMonitor .right {
  overflow: scroll;
  width: 50%;
}

.TextReuseClusterMonitor .right {
  left: 50%;
}

.TextReuseClusterMonitor .left p .added,
.TextReuseClusterMonitor .right p .removed {
  display: none;
}

.TextReuseClusterMonitor p .removed {
  color: inherit;
  opacity: 1;
}

.TextReuseClusterMonitor p .added {
  color: inherit;
  font-weight: bold;
}

.TextReuseClusterMonitor p .removed,
.TextReuseClusterMonitor p .added {
  background-color: white;
}

.TextReuseClusterMonitor.bg-dark p {
  color: var(--clr-grey-800);
}

.TextReuseClusterMonitor.bg-dark p .added {
  background-color: #42fd002e;
  color: white;
}

.TextReuseClusterMonitor.bg-dark p .removed {
  background-color: #ff272763;
  color: white;
}
</style>

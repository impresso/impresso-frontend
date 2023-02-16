<template>
  <div class="TextReuseClusterMonitor d-flex flex-column" v-if="passages.length > 0">
    <div class="flex-shrink-1">
      <div class="p-3">
        <span class="text-white mr-2">{{ passages.length }} passages</span>
        <i-dropdown
          v-model="orderBy"
          :options="
            orderByOptions.map(value => ({
              value,
              text: $t(`sort_${value}`),
            }))
          "
          class="mr-auto"
          size="sm"
          variant="outline-primary"
        ></i-dropdown>
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
      <div class="left w-50 position-absolute h-100 ">
        <p class="p-3" v-if="diff.length">
          <span v-for="part in diff">
            <span v-if="part.added" class="added">{{ part.value }}</span>
            <span v-else-if="part.removed" class="removed">{{ part.value }}</span>
            <span v-else-if="part.value">{{ part.value }}</span>
          </span>
        </p>
        <p class="p-3" v-else>
          {{ startPassage.content }}
        </p>
      </div>
      <div class="right w-50 position-absolute h-100">
        <p class="p-3">
          <span v-for="part in diff">
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
import ItemLabel from './modules/lists/ItemLabel'
import { textReusePassages } from '@/services'
import TextReusePassage from '@/models/TextReusePassage'
import TextReusePassageItemLabel from './modules/lists/TextReusePassageItemLabel'
import { optimizeFilters } from '@/logic/filters'
// onmounted load the first 2 text reuse passages from textreusepassage endpoint

const OrderByOptions = ['date', '-date', 'size', '-size']

export default {
  name: 'TextReuseClusterMonitor',
  components: {
    ItemLabel,
    TextReusePassageItemLabel,
  },
  props: {
    // item is a textReuseCluster item
    item: {
      type: Object,
      required: true,
    },
    filters: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    paginationCurrentPage: 1,
    paginationPerPage: 2,
    orderBy: 'date',

    passages: [],
    totalPassages: -1,
    isLoading: false,
    orderByOptions: OrderByOptions,
  }),

  methods: {
    async loadPassages({ query }) {
      this.isLoading = true
      const { data, total } = await textReusePassages.find({ query }).catch(err => {
        console.error('[TextReuseClusterMonitor] loadPassages', err)
        this.isLoading = false
        return { data: [] }
      })
      this.passages = data.map(d => new TextReusePassage(d))
      this.totalPassages = total
    },
  },
  computed: {
    startPassage() {
      if (this.passages.length) {
        return this.passages[0]
      }
      return null
    },
    endPassage() {
      if (this.passages.length > 1) {
        return this.passages[1]
      }
      return null
    },
    diff() {
      if (this.startPassage && this.endPassage) {
        return diffChars(this.startPassage.content, this.endPassage.content)
      }
      return []
    },
    searchApiQueryParameters() {
      const query = {
        skip: this.paginationPerPage * (this.paginationCurrentPage - 1),
        page: this.paginationCurrentPage,
        limit: this.paginationPerPage,
        orderBy: this.orderBy,
        filters: this.filters.length
          ? optimizeFilters(this.filters)
          : [{ type: 'textReuseCluster', q: this.item.id }],
        addons: { newspaper: 'text' },
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
  },
  watch: {
    searchApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] @searchApiQueryParameters \n query:', query)
        await this.loadPassages({ query })
      },
      immediate: true,
    },
  },
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
  opacity: 0.5;
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
  background-color: transparent;
  color: white;
}
.TextReuseClusterMonitor.bg-dark p .removed {
  background-color: transparent;
  color: var(--clr-grey-600);
}
</style>

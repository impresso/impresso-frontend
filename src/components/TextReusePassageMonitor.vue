<template>
  <div class="TextReusePassageMonitor d-flex flex-column">
    <div class="flex-shrink-1">
      <!-- add pagination for startPassage and endPassage -->
      <div class="d-flex flex-row w-100 py-2 align-items-center TextReusePassageMonitor_pagination">
        <div class="mx-3 d-flex flex-wrap align-items-center">
          <div
            v-html="
              $tc('passages_in_same_cluster', totalPassages, {
                offset: endPassageOffset + 1,
                n: totalPassages
              })
            "
          />
          <i-dropdown
            v-model="endPassageOrderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`)
              }))
            "
            class="ml-2"
            size="sm"
            variant="outline-tertiary"
          ></i-dropdown>
        </div>
      </div>
      <div class="d-flex flex-row TextReusePassageMonitor_header">
        <TextReusePassageItemLabel :item="item" class="px-3" />
        <TextReusePassageItemLabel v-if="endPassage" :item="endPassage" class="px-3" />
      </div>
    </div>
    <div class="position-relative flex-grow-1 mb-1">
      <div class="left w-50 position-absolute h-100">
        <p class="m-3 border-top border-tertiary pt-3" v-if="diff.length">
          <span v-for="(part, i) in diff" :key="i">
            <span v-if="part.added" class="added">{{ part.value }}</span>
            <span v-else-if="part.removed" class="removed">{{ part.value }}</span>
            <span v-else-if="part.value">{{ part.value }}</span>
          </span>
        </p>
        <p class="m-3 border-top border-tertiary pt-3" v-else>
          {{ item.content }}
        </p>
      </div>
      <div class="right w-50 position-absolute h-100 bg-dark">
        <p class="m-3 border-top border-tertiary pt-3">
          <span v-for="(part, i) in diff" :key="i">
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
import TextReusePassage from '@/models/TextReusePassage'
import TextReusePassageItemLabel from './modules/lists/TextReusePassageItemLabel.vue'
import { textReusePassages } from '@/services'
import { offset } from '@floating-ui/vue'
const OrderByOptions = ['date', '-date', 'size', '-size']

export default {
  name: 'TextReusePassageMonitor',
  components: {
    TextReusePassageItemLabel
  },
  props: {
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
    endPassage: null,
    endPassageOrderBy: '-date',
    endPassageOffset: 0,
    endPassageIsLoading: false,
    orderByOptions: OrderByOptions
  }),
  methods: {
    async loadEndPassage({ query }) {
      console.debug('[TextReusePassageMonitor] loadEndPassage', query)
      this.endPassageIsLoading = true
      await textReusePassages
        .find({ query })
        .then(res => {
          console.debug('[TextReusePassageMonitor] loadEndPassage result', res)
          if (!res.data.length) {
            this.endPassage = null
            this.endPassageIsLoading = false
            return res
          }
          this.endPassage = new TextReusePassage(res.data[0])
          this.totalPassages = res.total
          return res
        })
        .catch(err => {
          console.error('[TextReusePassageMonitor] loadPassages', err)
          this.endPassageIsLoading = false
          return { data: [] }
        })
      this.endPassageIsLoading = false
    }
  },
  computed: {
    diff() {
      if (this.endPassage) {
        return diffChars(this.item.content, this.endPassage.content)
      }
      return []
    },
    searchApiEndPassageQueryParameters() {
      // filters.push({ type: 'id', q: this.item.id, context: 'exclude' })
      const query = {
        offset: parseInt(this.endPassageOffset, 10),
        limit: 1,
        order_by: this.endPassageOrderBy,
        filters: [
          { type: 'textReuseCluster', q: this.item.textReuseCluster.id },
          { type: 'id', q: this.item.id, context: 'exclude' }
        ],
        addons: { newspaper: 'text' }
      }

      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    }
  },
  watch: {
    searchApiEndPassageQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        await this.loadEndPassage({ query })
      },
      immediate: true
    }
  }
}
</script>
<style lang="scss">
.TextReusePassageMonitor .left,
.TextReusePassageMonitor .right {
  overflow: scroll;
  width: 50%;
}

.TextReusePassageMonitor .right {
  left: 50%;
}

.TextReusePassageMonitor .left p .added,
.TextReusePassageMonitor .right p .removed {
  display: none;
}

.TextReusePassageMonitor p .removed {
  color: inherit;
  opacity: 1;
}

.TextReusePassageMonitor p .added {
  color: inherit;
  font-weight: bold;
}

.TextReusePassageMonitor p .removed,
.TextReusePassageMonitor p .added {
  background-color: white;
}

.TextReusePassageMonitor p {
  color: var(--clr-grey-800);
}

.TextReusePassageMonitor p .added {
  background-color: #0c7bdc;
  color: white;
}

.TextReusePassageMonitor p .removed {
  background-color: #ffc20a;
  color: black;
}

.TextReusePassageMonitor_pagination {
  color: var(--clr-grey-800);
}

.TextReusePassageMonitor_header .TextReusePassageItemLabel {
  width: 50%;
  margin: 0;
}
</style>
<i18n lang="json">
{
  "en": {
    "sort_date": "sorted by date",
    "sort_-date": "sorted by date (desc)",
    "sort_size": "sorted by size",
    "sort_-size": "sorted by size (desc)",
    "passages_in_same_cluster": "Compare the passage on the left side with passage <b>#{offset}</b> of <b>{ n }</b> in the same cluster"
  }
}
</i18n>

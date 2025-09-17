<template>
  <div>
    <h3 class="my-3 small-caps font-weight-bold collapsible-header" @click="toggleCollapse">
      <span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
      List of known metadata for this newspaper
    </h3>
    <div v-if="!isCollapsed">
      <table class="table border rounded">
        <thead class="small-caps font-weight-bold">
          <tr>
            <th>metadata</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in properties" v-bind:key="prop.name">
            <td>{{ prop.label }}</td>
            <td>
              <a :href="prop.value" target="_blank" v-if="prop.isUrl">{{ prop.value }}</a>
              <span v-else>
                {{ prop.value }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetadataTable',
  props: {
    properties: {
      type: Array,
      required: true,
      default: () => []
    },
    initialCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: this.initialCollapsed
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    }
  }
}
</script>

<style lang="scss" scoped>
.collapsible-header {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }
}

.collapse-icon {
  margin-right: 0.5rem;
  font-size: 0.8em;
  transition: transform 0.2s ease;
}

.table {
  background-color: white;


  td[aria-colindex='2'] {
    overflow-wrap: anywhere;
    font-size: smaller;
  }
}
</style>
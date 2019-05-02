<template lang="html">
  <div class="filter-monitor">
    <div>
      <b-dropdown size="sm" variant="outline-primary">
        <template slot="button-content">
          <span v-html="$t(`label.${type}.context.${filter.context}`)"/>
        </template>
        <b-dropdown-item
          v-for="option in contexts"
          v-bind:active="filter.context === option"
          v-bind:key="option"
          v-on:click="changeFilterContext(option)"
        ><span class="small" v-html="$t(`label.${type}.context.${option}`)"></span></b-dropdown-item>
      </b-dropdown>
      <b-dropdown v-if="operators.length > 1" size="sm" variant="outline-primary">
        <template slot="button-content">
          <span v-html="$t(`op.${filter.op}.${filter.context}`)"/>
        </template>
        <b-dropdown-item
          v-for="option in operators"
          v-bind:active="filter.op === option"
          v-bind:key="option"
          v-on:click="changeFilterOperator(option)"
        ><span class="small" v-html="$t(`op.${option}.${filter.context}`)"></span></b-dropdown-item>
      </b-dropdown>
    </div>
    <div v-for="item in filter.items" :key="item.uid">
      <b-form-checkbox v-model="item.checked" @change="toggleFilterItem($event, item)">
        <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
        <span v-if="type === 'newspaper'">{{ item.name }}</span>
        <span v-if="type === 'language'">{{ $t(`languages.${item.uid}`) }}</span>
        <span v-if="item.count">({{ $n(item.count)}})</span>
      </b-form-checkbox>
    </div>
    <div class="items-to-add" v-if="itemsToAdd.length">
      <div v-for="item in itemsToAdd">
        <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
        <span v-if="type === 'newspaper'">{{ item.name }}</span>
        <span v-if="type === 'language'">{{ $t(`languages.${item.uid}`) }}</span>
        <span v-if="item.count">({{ $n(item.count)}})</span>
      </div>
    </div>

    <b-button v-if="filter.touched || itemsToAdd.length" block size="sm" variant="outline-primary" @click="applyFilter()">
      <span v-if="itemsToAdd.length || filter.items.length - filter.q.length">
        {{
          $t(`label.${type}.update`, {
            added: itemsToAdd.length,
            removed: filter.items.length - filter.q.length  
          })
        }}
      </span>
      <span v-else>{{ $t(`label.${type}.apply`)}}</span>
    </b-button>
  </div>
</template>

<script>
export default {
  props: {
    type: String, // being topic, newspaper, collection, language ...
    operators: Array,
    contexts: {
      type: Array,
      default: () => ['include', 'exclude'],
    },
    filter: Object,
    itemsToAdd: {
      type: Array, // from outside
      default: () => [],
    },
  },
  methods: {
    applyFilter() {
      this.updateFilter({});
      this.$emit('filter-applied');
      this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', 1);
      this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
    },
    updateFilter({ op, context }) {
      const q = this.filter.items.concat(this.itemsToAdd).reduce((acc, d) => {
        console.log('adding', d.uid, d.checked);
        if (d.checked) {
          acc.push(d.uid);
        }
        return acc;
      }, []);

      if (!q.length) {
        this.$store.commit('search/REMOVE_FILTER', this.filter);
        this.$emit('filter-removed');
      } else {
        // commit the update
        this.$store.commit('search/UPDATE_FILTER', {
          filter: this.filter,
          q,
          op,
          context,
        });
        this.$emit('filter-updated');
      }
    },
    changeFilterOperator(op) {
      this.updateFilter({ op });
    },
    changeFilterContext(context) {
      this.updateFilter({ context });
    },
    toggleFilterItem(checked, item) {
      item.checked = checked;
      this.$store.commit('search/UPDATE_FILTER_ITEM', {
        filter: this.filter,
        item,
      });
    },
  },
};
</script>

<style lang="scss">
.items-to-add {
  background: yellow;
}
</style>
<i18n>
{
  "en": {
    "op": {
      "OR": {
        "include": "at least <b>one</b> of the following",
        "exclude": "<b>any</b> of the following"
      },
      "AND": {
        "include": "<b>all</b> of the following",
        "exclude": "<b>any</b> of the following"
      }
    },
    "label": {
      "topic": {
        "title": "filter by topic",
        "selected": "filter results if <b>one of {count} selected</b> topic applies",
        "filtered": "filter results if <b>one of {count} selected</b> topic applies",
        "description": "check one or more topics to filter results",
        "update": "apply changes (added: {added}, removed: {removed})",
        "clear": "reset",
        "apply": "apply",
        "context": {
          "include": "Containing",
          "exclude": "<b>NOT</b> containing"
        }
      },
      "newspaper": {
        "title": "filter by newspaper titles",
        "selected": "filter results if they appear in <b>one of {count} selected</b> newspapers",
        "description": "check one or more newspaper to filter results",
        "clear": "reset",
        "apply": "apply",
        "context": {
          "include": "Published in",
          "exclude": "<b>NOT</b> published in"
        }
      },
      "language": {
        "title": "filter by language of articles",
        "selected": "filter results if they are written in <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply",
        "clear": "reset"
      }
    }
  },
  "nl": {
    "label": {
      "newspaper": "Krant",
      "language": "Taal"
    }
  }
}
</i18n>

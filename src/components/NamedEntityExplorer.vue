<template lang="html">
  <div>

    <div class="results">
      <ul class="nav nav-fill">
        <li class="nav-item " v-for="t in types" :key="t">
          <a
          class="nav-link text-capitalize"
          href="#"
          v-bind:class="{active: (type === t)}"
          v-on:click.prevent="selectType(t)"
          >{{t}}</a>
        </li>
      </ul>

        <ul class="nav nav-fill">
          <li class="nav-item " v-for="p in perdiods" :key="p"><a
            class="nav-link text-capitalize"
            href='#'
            v-bind:class="{active: (period === p)}"
            v-on:click.prevent="selectPeriod(p)"
            >{{p}}</a></li>
        </ul>
      <date-slider v-model="issue" v-bind:period="period"></date-slider>

      <div class="list">
        <div class="media" v-for="(item, index) in issue.entities" :key="index">
          <img class="mr-3" src="http://www.placehold.it/48x48" alt="Generic placeholder image">
          <div class="media-body">
            <p class="m-0">
              <strong>{{item.name}}</strong>
              <b-badge
                v-for="label in getLabel(item)"
                :key="label"
                v-bind:class="label"
                class="float-right">
                {{label}}
              </b-badge>
            </p>
            <p>Lorem ipsum dolor sit amet</p>
            <hr>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
/**
 * @deprecated Not used anywhere
 */
import DateSlider from './modules/NamedEntityExplorerDateSlider';

export default {
  props: {
    modelValue: {
      default: null,
    },
  },
  data: () => ({
    types: ['title', 'corpus'],
    type: 'title',
    perdiods: ['day', 'week', 'month'],
    period: 'day',
  }),
  computed: {
    issue() { return this.modelValue }
  },
  methods: {
    selectType(type) {
      this.type = type;
    },
    selectPeriod(period) {
      this.period = period;
    },
    getLabel(item) {
      return item.labels.filter((label) => {
        if (label !== 'entity') {
          return label;
        }

        return false;
      });
    },
  },
  components: {
    DateSlider,
  },
};
</script>

<style scoped lang="less">

h1 {
    color: red;
}

.nav {
    margin-bottom: 5px;
    .nav-item {
        padding-bottom: 5px;
        padding-top: 5px;
        border-color: black;
        .nav-link {
            padding: 4px;
            color: black;
            border-radius: 0;
            border: none;
            transition: all 400ms;
            font-size: smaller;
            &:hover {
                background: #eeeeee;
            }
            &.active {
                background: #FFEB3B;
            }
        }
    }
}

.results {
    margin-bottom: 15px;
}

.period {
    margin: 0;
    padding: 0;
    width: 100%;
    white-space: nowrap;
    li {
        display: inline-block;
        width: 100% / 3;
        margin: 0;
        padding: 0;
        a {
            text-align: center;
            display: block;
            width: 100%;
        }
    }
}

.badge.location {
    background: #FFEB3B;
    color: #000000;
}

.badge.person {
    background: #2196F3;
    color: #FFFFFF;
}
</style>

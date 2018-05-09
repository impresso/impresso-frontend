<template lang="html">
  <div>

    <div class="results">
      <ul class="nav nav-fill">
        <li class="nav-item bb" v-for="t in types">
          <a
          class="nav-link text-capitalize"
          href="#"
          v-bind:class="{active: (type === t)}"
          v-on:click.prevent="selectType(t)"
          >{{t}}</a>
        </li>
      </ul>
      <date-slider v-bind:period="period"></date-slider>
      <div class="selection">
        <ul class="nav nav-fill">
          <li class="nav-item bt" v-for="p in perdiods"><a
            class="nav-link text-capitalize"
            href='#'
            v-bind:class="{active: (period === p)}"
            v-on:click.prevent="selectPeriod(p)"
            >{{p}}</a></li>
        </ul>
      </div>
      <div class="list">
        <div class="media" v-for="item in [1,2,3]">
          <img class="mr-3" src="http://www.placehold.it/48x48" alt="Generic placeholder image">
          <div class="media-body">
            <p class="m-0"><strong>Media heading</strong></p>
            <p>Test 123</p>
            <hr>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DateSlider from './NamedEntityExplorerDateSlider';

export default {
  data: () => ({
    types: ['title', 'corpus'],
    type: 'title',
    perdiods: ['day', 'week', 'month'],
    period: 'day',
  }),
  methods: {
    selectType(type) {
      this.type = type;
    },
    selectPeriod(period) {
      this.period = period;
    },
  },
  components: {
    DateSlider,
  },
};
</script>

<style scoped lang="less">
@import "./../../assets/less/style.less";

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
                background: @clr-grey-200;
            }
            &.active {
                background: @clr-yellow-500;
            }
        }
    }
}

.results {
    margin-bottom: 15px;

    .list {
        // padding: 4px;
    }
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
</style>

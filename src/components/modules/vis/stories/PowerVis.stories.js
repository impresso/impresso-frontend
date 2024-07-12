import { action } from '@storybook/addon-actions'
import PowerVisBase from '../PowerVisBase.vue'

import './assets/legacy/bootstrap-impresso-theme.css'

export default {
  title: 'Components/Modules/Vis/PowerVis',
  component: PowerVisBase,
}

const Template = args => ({
  components: { PowerVisBase },
  setup() {
    return { args }
  },
  methods: {
    itemClicked: action('item clicked'),
  },
  template: `
    <div style="height: 600px;">
      <PowerVisBase v-bind="args" @item:click="itemClicked">
        <template v-slot:header>
          <span>Header rendered here. For example, dropdown box(es)</span>
        </template>
        <template v-slot:footer>
          <span>footer rendered here. for example, checkboxes</span>
        </template>
      </PowerVisBase>
    </div>
  `,
})

export const TRPassages = Template.bind({})
TRPassages.args = {
  data: {
    items: [
      {
        domain: {
          label: 'L\'Express',
          value: 'EXP',
        },
        value: {
          count: 3186482,
          items: [
            {
              term: 'EXP',
              count: 3186482,
            },
          ],
        },
      },
      {
        domain: {
          label: 'L\'Impartial',
          value: 'IMP',
        },
        value: {
          count: 2973547,
          items: [
            {
              term: 'IMP',
              count: 2973547,
            },
          ],
        },
      },
    ],
    itemsDictionary: {
      EXP: 'L\'Express',
      IMP: 'L\'Impartial',
    },
    meta: {
      facetType: 'term',
      domain: 'newspaper',
      filters: [],
    },
  },
}

export const LineChart = Template.bind({})

LineChart.args = {
  data: {
    items: [
      {
        domain: 20,
        value: {
          count: 3186482,
        },
      },
      {
        domain: 100,
        value: {
          count: 3186482,
        },
      },
    ],
    meta: {
      facetType: 'numeric',
      domain: 'size',
      filters: [],
    },
  },
}



export const BarChart = Template.bind({})

BarChart.args = {
  data: {
    items: [
      {
        domain: {
          label: 'L\'Express',
          value: 'EXP'
        },
        value: {
          count: 2816866,
          stddev: 23.252782736769444,
          min: 0,
          max: 100,
          mean: 63.649138850604686,
          p99_7: 100
        }
      },
      {
        domain: {
          label: 'L\'Impartial',
          value: 'IMP'
        },
        value: {
          count: 2633785,
          stddev: 23.457636568110768,
          min: 0,
          max: 100,
          mean: 64.4376687794933,
          p99_7: 100
        }
      },
      {
        domain: {
          label: 'Journal de Genève',
          value: 'JDG'
        },
        value: {
          count: 2176771,
          stddev: 22.100577396781706,
          min: 0,
          max: 100,
          mean: 63.21553174509588,
          p99_7: 100
        }
      },
      {
        domain: {
          label: 'Gazette de Lausanne',
          value: 'GDL'
        },
        value: {
          count: 2006765,
          stddev: 22.58950937575116,
          min: 0,
          max: 100,
          mean: 63.33867054229699,
          p99_7: 100
        }
      }
    ],
    meta: {
      facetType: 'numeric',
      domain: 'newspaper',
      filters: []
    }
  }
}


export const BarChartHorizontal = Template.bind({})

BarChartHorizontal.args = {
  data: {
    items: BarChart.args.data.items,
    meta: {
      ...BarChart.args.data.meta,
      horizontal: true
    }
  }
}

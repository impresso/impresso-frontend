import { action } from 'storybook/actions'
import PowerChart from '../PowerChart.vue'

import '../../../../assets/legacy/bootstrap-impresso-theme.css'

export default {
  title: 'Components/Modules/Vis/PowerChart',
  component: PowerChart
}

const Template = args => ({
  components: { PowerChart },
  setup() {
    return { args }
  },
  methods: {
    itemClicked: action('item clicked')
  },
  template: `
    <div style="height: 300px;">
      <PowerChart v-bind="args" @item:click="itemClicked"/>
    </div>
  `
})

const randomInt = max => Math.floor(Math.random() * max)

const sampleDomains = [...new Array(20)].map((_, i) => ({
  label: `Domain ${i}`,
  value: randomInt(100)
}))

const sampleData = [...new Array(50)].map(() => {
  const domainIdx = randomInt(19)
  const domain = sampleDomains.find((_, i) => domainIdx === i)
  return {
    value: Math.random() * 100,
    domain
  }
})

export const CircleChart = Template.bind({})
CircleChart.args = {
  chartType: 'circle',
  data: sampleData,
  lineMetrics: [
    {
      id: 'a',
      extractor: v => (v <= 0.5 ? Math.random() * 100 : v)
    },
    {
      id: 'b',
      extractor: v => (v > 0.5 ? Math.random() * 100 : v)
    }
  ],
  itemsDictionary: {
    a: 'a',
    b: 'b'
  }
}

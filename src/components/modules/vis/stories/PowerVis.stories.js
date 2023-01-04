import { action } from '@storybook/addon-actions'
import PowerVisBase from '../PowerVisBase.vue'

import 'impresso-theme/dist/css/bootpresso.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

export default {
  title: 'Components/Modules/Vis/PowerVis',
  component: PowerVisBase
}

const Template = args => ({
  components: { PowerVisBase },
  setup() {
    return { args }
  },
  methods: {
    itemClicked: action('item clicked')
  },
  template: `
    <div style="height: 300px;">
      <PowerVisBase v-bind="args" @item:click="itemClicked">
      </PowerVisBase>
    </div>
  `
})

export const TRPassages = Template.bind({})
TRPassages.args = {
  data: {
    items: [
      {
        domain: {
          label: 'L\'Express',
          value: 'EXP'
        },
        value: {
          count: 3186482,
          items: [
            {
              term: 'EXP',
              count: 3186482
            }
          ]
        }
      },
      {
        domain: {
          label: 'L\'Impartial',
          value: 'IMP'
        },
        value: {
          count: 2973547,
          items: [
            {
              term: 'IMP',
              count: 2973547
            }
          ]
        }
      }
    ],
    itemsDictionary: {
      EXP: 'L\'Express',
      IMP: 'L\'Impartial'
    },
    meta: {
      facetType: 'term',
      domain: 'newspaper',
      filters: []
    }
  }
}

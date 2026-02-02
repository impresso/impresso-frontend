import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Minimap from './Minimap.vue'
import type { MinimapProps } from './Minimap.vue'

const meta: Meta<typeof Minimap> = {
  title: 'components/Minimap',
  component: Minimap,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        Minimap
      },
      template: `
        <div style="display: flex; gap: 20px; padding: 20px; background: #fafafa; min-height: 400px;">
          <div style="flex: 1; border: 2px solid #ddd; overflow: auto; background: white;" id="scrollContainer">
            <div style="width: 800px; height: 1200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
              <div style="color: white; font-size: 14px; line-height: 1.6;">
                <h2>Scrollable Content</h2>
                <p>This is example content to demonstrate the minimap functionality. Scroll around and watch the minimap viewport indicator update in real-time.</p>
                <p v-for="i in 50" :key="i" style="margin: 10px 0;">{{ i }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </div>
          </div>
          <div style="width: 220px;">
            <Minimap
              v-bind="args"
              :scroll-top="scrollTop"
              :scroll-left="scrollLeft"
              @update:scroll-top="(value) => scrollTop = value"
              @update:scroll-left="(value) => scrollLeft = value"
            />
          </div>
        </div>
      `,
      beforeCreate() {
        this.scrollTop = 0
        this.scrollLeft = 0
      },
      mounted() {
        const container = document.getElementById('scrollContainer')
        if (container) {
          container.addEventListener('scroll', () => {
            this.scrollTop = container.scrollTop
            this.scrollLeft = container.scrollLeft
          })
        }
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    clientHeight: 300,
    clientWidth: 400,
    scrollHeight: 1200,
    scrollWidth: 800,
    scrollTop: 0,
    scrollLeft: 0
  } as MinimapProps
}

export const PartiallyScrolled: Story = {
  args: {
    clientHeight: 300,
    clientWidth: 400,
    scrollHeight: 1200,
    scrollWidth: 800,
    scrollTop: 300,
    scrollLeft: 100
  } as MinimapProps
}

export const SmallViewport: Story = {
  args: {
    clientHeight: 100,
    clientWidth: 100,
    scrollHeight: 1200,
    scrollWidth: 800,
    scrollTop: 0,
    scrollLeft: 0
  } as MinimapProps
}

export const LargeContent: Story = {
  args: {
    clientHeight: 200,
    clientWidth: 300,
    scrollHeight: 3000,
    scrollWidth: 2000,
    scrollTop: 500,
    scrollLeft: 200
  } as MinimapProps
}

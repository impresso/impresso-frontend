import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, onMounted } from 'vue'
import Minimap from './Minimap.vue'
import type { MinimapProps } from './Minimap.vue'

const meta: Meta<typeof Minimap> = {
  title: 'components/Minimap',
  component: Minimap,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const scrollTop = ref(args.scrollTop || 0)
        const scrollLeft = ref(args.scrollLeft || 0)

        onMounted(() => {
          const container = document.getElementById('scrollContainer')
          if (container) {
            container.addEventListener('scroll', () => {
              scrollTop.value = container.scrollTop
              scrollLeft.value = container.scrollLeft
            })
          }
        })

        return { args, scrollTop, scrollLeft }
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
          <div style="width: 220px; height: 200px">
            <Minimap
              :client-height="args.clientHeight"
              :client-width="args.clientWidth"
              :scroll-height="args.scrollHeight"
              :scroll-width="args.scrollWidth"
              :scroll-top="scrollTop"
              :scroll-left="scrollLeft"
              @updateScroll="(value) => { scrollTop = value.scrollTop; scrollLeft = value.scrollLeft }"
            />
          </div>
        </div>
      `
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

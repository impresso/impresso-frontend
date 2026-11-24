import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemAccessDimensions from '@/components/ContentItemAccessDimensions.vue'
import type { ContentItemAccessDimensionsProps } from '@/components/ContentItemAccessDimensions.vue'

const meta: Meta<typeof ContentItemAccessDimensions> = {
  title: 'Components/ContentItemAccessDimensions',
  component: ContentItemAccessDimensions,
  tags: ['autodocs'],
  args: {
    exploreGranted: false,
    transcriptGranted: false,
    facsimileGranted: false,
    compact: true
  } as ContentItemAccessDimensionsProps
}

export default meta
type Story = StoryObj<typeof meta>

export const AllCombinations: Story = {
  render: args => ({
    components: { ContentItemAccessDimensions },
    setup() {
      const combinations = [
        { exploreGranted: false, transcriptGranted: false, facsimileGranted: false },
        { exploreGranted: true, transcriptGranted: false, facsimileGranted: false },
        { exploreGranted: false, transcriptGranted: true, facsimileGranted: false },
        { exploreGranted: false, transcriptGranted: false, facsimileGranted: true },
        { exploreGranted: true, transcriptGranted: true, facsimileGranted: false },
        { exploreGranted: true, transcriptGranted: false, facsimileGranted: true },
        { exploreGranted: false, transcriptGranted: true, facsimileGranted: true },
        { exploreGranted: true, transcriptGranted: true, facsimileGranted: true }
      ]
      return { args, combinations }
    },
    template: `
      <div class="d-flex flex-column align-items-start gap-3 p-4">
        <p>Dots from left to right: Web App, transcript, facsimile.</p>
        <ContentItemAccessDimensions
          v-for="(combination, index) in combinations"
          :key="index"
          v-bind="{ ...args, ...combination }"
        />
      </div>
    `
  })
}

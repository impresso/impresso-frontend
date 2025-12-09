import type { Meta, StoryObj } from '@storybook/vue3'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'
import type { ContentItemIdLabelProps } from '@/components/ContentItemIdLabel.vue'

const meta: Meta<typeof ContentItemIdLabel> = {
  title: 'Components/ContentItemIdLabel',
  component: ContentItemIdLabel,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ContentItemIdLabel },
      template: `
        <div class="bg-light d-flex align-items-center p-4" style="height: 200px;width: 100%;">
          <ContentItemIdLabel v-bind="args">
          </ContentItemIdLabel>
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: {
      id: 'GDU-1900-01-01-a-i0234',
      type: 'ar',
      dataProvider: 'Impresso',
      publicationDate: '2024-01-01',
      title: 'Sample Article',
      nbPages: 10,
      pages: [],
      transcriptLength: 0,
      access: {
        dataDomain: 'prt',
        copyright: 'in_cpy',
        accessBitmaps: {
          explore: 'AAAAAAAAAAI=',
          getTranscript: 'AAAAgAAAAAA=',
          getImages: 'AAAAgAAAAAA='
        }
      }
    }
  } as ContentItemIdLabelProps
}

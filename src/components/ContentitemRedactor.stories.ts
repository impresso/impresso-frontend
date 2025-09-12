import type { Meta, StoryObj } from '@storybook/vue3'
import ContentItemRedactor, { ContentItemRedactorProps } from '@/components/ContentItemRedactor.vue'
import { PlanGuestAsBigInt } from '@/constants'
import { bigIntToBase64Bytes } from '@/util/bigint'

const meta: Meta<typeof ContentItemRedactor> = {
  title: 'Components/ContentItemRedactor',
  component: ContentItemRedactor,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ContentItemRedactor },
      template: `
        <div class="bg-light d-flex align-items-center p-4" style="height: 200px;width: 100%;">
          <ContentItemRedactor v-bind="args">
          </ContentItemRedactor>
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
      id: 'article',
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
    },
    userBitmap: bigIntToBase64Bytes(PlanGuestAsBigInt), // guest
    context: 'image'
  } as ContentItemRedactorProps
}

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemAccess from '@/components/ContentItemAccess.vue'
import type { ContentItemAccessProps } from '@/components/ContentItemAccess.vue'
import { useUserStore } from '@/stores/user'
import { bigIntToBase64Bytes } from '@/util/bigint'

const meta: Meta<typeof ContentItemAccess> = {
  title: 'Components/ContentItemAccess',
  component: ContentItemAccess,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const userStore = useUserStore()
        userStore
          .refreshUser()
          .catch(() => {})
          .finally(() => {
            userStore.setAcceptTermsDate(new Date().toISOString())
          })
        userStore.setBitmap(bigIntToBase64Bytes(BigInt('0b1111111111'))) // full access
        return { args }
      },
      components: { ContentItemAccess },
      template: `
        <div class="bg-light d-flex align-items-center p-4" style="height: 200px;width: 100%;">
          <ContentItemAccess v-bind="args">
          </ContentItemAccess>
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
    }
  } as ContentItemAccessProps
}

export const ExploreAndTranscript: Story = {
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
          getTranscript: 'AAAAAAAAAAI=',
          getImages: 'AAAAgAAAAAA='
        }
      }
    }
  } as ContentItemAccessProps
}

export const ExploreAndFacsimile: Story = {
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
          getImages: 'AAAAAAAAAAI='
        }
      }
    }
  } as ContentItemAccessProps
}
export const fullAccess: Story = {
  args: {
    item: {
      id: 'open-article',
      type: 'ar',
      dataProvider: 'Impresso',
      publicationDate: '2024-01-01',
      title: 'Open Access Article',
      nbPages: 10,
      pages: [],
      transcriptLength: 0,
      access: {
        dataDomain: 'prt',
        copyright: 'in_cpy',
        accessBitmaps: {
          explore: 'AAAAAAAAAAE=',
          getTranscript: 'AAAAAAAAAAE=',
          getImages: 'AAAAAAAAAAE='
        }
      }
    }
  } as ContentItemAccessProps
}

export const noAccess: Story = {
  args: {
    item: {
      id: 'very-closed-article',
      type: 'ar',
      dataProvider: 'Impresso',
      publicationDate: '2024-01-01',
      title: 'Very Closed Article',
      nbPages: 10,
      pages: [],
      transcriptLength: 0,
      access: {
        dataDomain: 'prt',
        copyright: 'in_cpy',
        accessBitmaps: {
          explore: 'AAAAAAAAQAA=',
          getTranscript: 'AAAAAAAAQAA=',
          getImages: 'AAAAAAAAQAA='
        }
      }
    }
  } as ContentItemAccessProps
}

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemCopyText from './ContentItemCopyText.vue'
import type { ContentItemCopyTextProps } from './ContentItemCopyText.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { MockDataProviders } from '.storybook/mockData/dataProviders'
import { getMediaSourceHandler } from '.storybook/mswHandlers'

const meta: Meta<typeof ContentItemCopyText> = {
  title: 'components/contentItem/ContentItemCopyText',
  component: ContentItemCopyText,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        // ContentItemCitation reads the data provider names from the window object
        ;(window as unknown as { impressoDataProviders: unknown }).impressoDataProviders =
          MockDataProviders
        return { args }
      },
      components: {
        ContentItemCopyText
      },
      template: `
        <div style="height: 300px; width: 100%">
          <div class="d-flex justify-content-end align-items-center gap-2">
            <ContentItemCopyText v-bind="args" />
            <button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle">
              Add to collection
            </button>
          </div>
          <p class="small text-muted mt-3">
            The button is only shown for public domain content items whose transcript the user can read.
          </p>
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [getMediaSourceHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const PublicDomain: Story = {
  args: {
    contentItem: MockContentItemPublicDomain
  } as ContentItemCopyTextProps
}

export const InCopyright: Story = {
  args: {
    contentItem: {
      ...MockContentItemPublicDomain,
      access: { ...MockContentItemPublicDomain.access, copyright: 'in_cpy' }
    }
  } as ContentItemCopyTextProps
}

export const PublicDomainWithoutTranscriptAccess: Story = {
  args: {
    contentItem: {
      ...MockContentItemPublicDomain,
      access: {
        ...MockContentItemPublicDomain.access,
        accessBitmaps: {
          ...MockContentItemPublicDomain.access.accessBitmaps,
          getTranscript: 'AAAAAAACAAA='
        }
      }
    }
  } as ContentItemCopyTextProps
}

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AudioContentItem from '@/pages/AudioContentItem.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import { contentItems as contentItemsService } from '@/services'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { createRouter, createWebHistory } from 'vue-router'

const createAudioContentItem = (): ContentItem => {
  return {
    ...MockContentItemPublicDomain,
    id: 'srf-2023-04-08-a-i0001',
    meta: {
      ...MockContentItemPublicDomain.meta,
      sourceType: 'radio_broadcast',
      sourceMedium: 'audio',
      date: '2023-04-08T10:30:00Z',
      mediaId: 'SRF-Radio'
    },
    text: {
      ...MockContentItemPublicDomain.text,
      title: 'Morning News Bulletin',
      content:
        'Welcome to the morning bulletin. Headlines include market updates and international affairs. We continue with regional updates and weather forecasts.',
      contentLength: 150,
      snippet: 'Welcome to the morning bulletin. Headlines include market updates...'
    },
    audio: {
      duration: '62',
      records: [
        {
          id: 'record-1',
          number: 1,
          audioFileUrl: 'https://example.org/audio/morning-news.mp3',
          audioSegmentsLocators: [
            {
              timeCode: [0, 8],
              textLocation: [0, 42],
              utteranceIndex: 0
            },
            {
              timeCode: [9, 16],
              textLocation: [43, 41],
              utteranceIndex: 1
            },
            {
              timeCode: [17, 30],
              textLocation: [84, 66],
              utteranceIndex: 2
            }
          ]
        }
      ]
    }
  }
}

const installRouterForContentItem = async (contentItemId: string) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/audio/:content_item_id',
        name: 'audioContentItemStory',
        component: AudioContentItem
      },
      {
        path: '/radio/search',
        name: 'searchRadio',
        component: { template: '<div />' }
      }
    ]
  })
  await router.replace({
    name: 'audioContentItemStory',
    params: { content_item_id: contentItemId }
  })
  await router.isReady()
  return router
}

const meta: Meta<typeof AudioContentItem> = {
  title: 'Pages/AudioContentItem',
  component: AudioContentItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    story => ({
      components: { Story: story() },
      async setup() {
        ;(contentItemsService.get as unknown as (id: string) => Promise<ContentItem>) =
          async id => {
            const item = createAudioContentItem()
            return {
              ...item,
              id
            }
          }

        const router = await installRouterForContentItem('srf-2023-04-08-a-i0001')
        return { router }
      },
      template: '<Story />'
    })
  ]
}

export const WithoutTranscriptLocators: Story = {
  decorators: [
    story => ({
      components: { Story: story() },
      async setup() {
        ;(contentItemsService.get as unknown as (id: string) => Promise<ContentItem>) =
          async id => {
            const item = createAudioContentItem()
            return {
              ...item,
              id,
              audio: {
                ...item.audio,
                records: [
                  {
                    ...item.audio!.records![0],
                    audioSegmentsLocators: []
                  }
                ]
              }
            }
          }

        const router = await installRouterForContentItem('srf-2023-04-08-a-i0001')
        return { router }
      },
      template: '<Story />'
    })
  ]
}

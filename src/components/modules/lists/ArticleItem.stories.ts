import type { Meta, StoryObj } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import ArticleItem from './ArticleItem.vue'
import { ArticleInterface } from '@/models/Article'
import { fn } from '@storybook/test'
import Newspaper from '@/models/Newspaper'
import Issue from '@/models/Issue'
import Page from '@/models/Page'
import Entity from '@/models/Entity'
import ArticleTopic from '@/models/ArticleTopic'
import Topic from '@/models/Topic'
import Match from '@/models/Match'

const meta: Meta<typeof ArticleItem> = {
  component: ArticleItem,
  title: 'Components/Lists/ArticleItem',
  tags: ['autodocs'],
  argTypes: {
    'onClick:title': { action: 'clicked' }
  },
  decorators: [
    vueRouter([
      {
        name: 'issue-viewer',
        path: '/nothing/:issue_uid',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      },
      {
        name: 'newspaper_metadata',
        path: '/nothing/:newspaper_uid',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      }
    ])
  ]
}

export default meta
type Story = StoryObj<typeof ArticleItem>

const mockArticle = {
  uid: 'gdl-1890-01-01-a-i0001',
  title: 'A sample article title with <em>highlighting</em>',
  excerpt:
    'This is a short excerpt of the article content. It gives a glimpse of what the article is about.',
  date: new Date('1890-01-01'),
  nbPages: 2,
  pages: [new Page({ num: 1, uid: 'p1' }), new Page({ num: 2, uid: 'p2' })],
  type: 'ar',
  size: 1500,
  newspaper: new Newspaper({
    uid: 'gdl',
    name: 'Gazette de Lausanne'
  }),
  issue: new Issue({
    uid: 'gdl-1890-01-01-i'
  }),
  mediaSource: { name: 'GDL', type: 'newspaper', id: 'gdl' },
  dataProvider: 'SBC',
  accessRight: 'pdm',
  locations: [
    new Entity({ uid: 'loc1', name: 'Geneva', countItems: 5 }),
    new Entity({ uid: 'loc2', name: 'Lausanne', countItems: 3 }),
    new Entity({ uid: 'loc3', name: 'Zurich', countItems: 2 }),
    new Entity({ uid: 'loc4', name: 'Bern', countItems: 1 }),
    new Entity({ uid: 'loc5', name: 'Basel', countItems: 1 })
  ],
  persons: [
    new Entity({ uid: 'per1', name: 'John Doe', countItems: 10 }),
    new Entity({ uid: 'per2', name: 'Jane Smith', countItems: 4 })
  ],
  topics: [
    new ArticleTopic({
      relevance: 0.9,
      topic: new Topic({ uid: 'topic1', label: 'Politics' })
    }),
    new ArticleTopic({
      relevance: 0.75,
      topic: new Topic({ uid: 'topic2', label: 'Economy' })
    }),
    new ArticleTopic({
      relevance: 0.5,
      topic: new Topic({ uid: 'topic3', label: 'Culture' })
    }),
    new ArticleTopic({
      relevance: 0.4,
      topic: new Topic({ uid: 'topic4', label: 'Sports' })
    }),
    new ArticleTopic({
      relevance: 0.3,
      topic: new Topic({ uid: 'topic5', label: 'Arts' })
    }),
    new ArticleTopic({
      relevance: 0.2,
      topic: new Topic({ uid: 'topic6', label: 'Science' })
    })
  ],
  matches: [
    new Match({ fragment: '... a sample <em>match</em> ...' }),
    new Match({ fragment: '... another <em>match</em> from the article...' })
  ],
  country: 'CH',
  dl: 100,
  isFront: false,
  language: 'fr',
  time: new Date('1890-01-01').getTime(),
  year: 1890,
  labels: [],
  regions: [],
  tags: [],
  images: [],
  isCC: false,
  collections: [],
  contentLineBreaks: [],
  regionBreaks: [],
  mentions: [],
  content: 'Full content of the article...'
} as ArticleInterface

export const Default: Story = {
  args: {
    item: mockArticle,
    showLink: true
  }
}

export const WithMeta: Story = {
  args: {
    ...Default.args,
    showMeta: true
  }
}

export const WithExcerpt: Story = {
  args: {
    ...Default.args,
    showExcerpt: true,
    showSize: true
  }
}

export const WithMatches: Story = {
  args: {
    ...Default.args,
    showMatches: true
  }
}

export const WithEntities: Story = {
  args: {
    ...Default.args,
    showEntities: true
  }
}

export const WithTopics: Story = {
  args: {
    ...Default.args,
    showTopics: true
  }
}

export const AsReference: Story = {
  args: {
    item: mockArticle,
    asReference: true,
    showMeta: true
  }
}

export const Full: Story = {
  args: {
    item: mockArticle,
    showLink: true,
    showMeta: true,
    showExcerpt: true,
    showSize: true,
    showMatches: true,
    showEntities: true,
    showTopics: true
  }
}

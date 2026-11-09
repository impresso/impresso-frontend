import type { Topic } from '@/models/generated/canonical'
import TopicModel from '@/models/Topic'

export const MockTopic: Topic & {
  label: string
  words: Topic['words'] & { l: number }[]
  excerpt: Topic['words'] & { l: number }[]
} = {
  id: 'tm-en-all-v2.0_tp42_en',
  language: 'en',
  model: 'tm-en-all-v2.0',
  label: 'railway · train · station · tunnel',
  words: [
    { w: 'railway', p: 0.95, l: 1 },
    { w: 'train', p: 0.88, l: 0.9 },
    { w: 'station', p: 0.82, l: 0.8 },
    { w: 'tunnel', p: 0.75, l: 0.7 }
  ],
  excerpt: [
    { w: 'The', p: 0.6, l: 0.6 },
    { w: 'railway', p: 0.95, l: 1 },
    { w: 'development', p: 0.7, l: 0.7 }
  ]
}

export const MockLabeledTopic = new TopicModel({
  ...MockTopic,
  excerpt: [],
  label: 'Railways and transport',
  longLabel: 'Railway development and public transport',
  description: 'Newspaper coverage of railway networks, stations, and trains.',
  contentItemsCount: 1250
})

export const MockWordsOnlyTopic = new TopicModel({
  ...MockTopic,
  label: undefined,
  excerpt: [],
  contentItemsCount: 42
})

export const MockMinimalTopic = new TopicModel({ id: MockTopic.id })

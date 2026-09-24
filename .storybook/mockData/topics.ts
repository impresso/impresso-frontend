import type { Topic } from '@/models/generated/canonical'

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

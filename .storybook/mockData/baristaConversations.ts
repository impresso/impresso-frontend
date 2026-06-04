import type { BaristaConversation } from '@/services/types/baristaConversations'

const createTimestamp = (minutesAgo: number): string => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export const MockBaristaConversations: BaristaConversation[] = [
  {
    baristaSessionId: 'iwa-1',
    label: 'Swiss press around WWI',
    userId: 42,
    dateCreated: createTimestamp(140),
    dateLastModified: createTimestamp(2)
  },
  {
    baristaSessionId: 'iwa-2',
    label: 'Economic crisis in 1930s',
    userId: 42,
    dateCreated: createTimestamp(280),
    dateLastModified: createTimestamp(12)
  },
  {
    baristaSessionId: 'iwa-3',
    label: 'Robert Schumann mentions',
    userId: 42,
    dateCreated: createTimestamp(420),
    dateLastModified: createTimestamp(28)
  },
  {
    baristaSessionId: 'iwa-4',
    label: 'Women movements in Geneva',
    userId: 42,
    dateCreated: createTimestamp(560),
    dateLastModified: createTimestamp(45)
  },
  {
    baristaSessionId: 'iwa-5',
    label: 'Railway development in Europe',
    userId: 42,
    dateCreated: createTimestamp(700),
    dateLastModified: createTimestamp(80)
  },
  {
    baristaSessionId: 'iwa-6',
    label: 'Sport chronicles in French newspapers',
    userId: 42,
    dateCreated: createTimestamp(840),
    dateLastModified: createTimestamp(120)
  },
  {
    baristaSessionId: 'iwa-7',
    label: 'Colonial narratives in Swiss press',
    userId: 42,
    dateCreated: createTimestamp(980),
    dateLastModified: createTimestamp(180)
  }
]

import type { ChatMessage } from '@/services/types/barista'

/**
 * Helper function to create timestamps with different times
 */
const createTimestamp = (minutesAgo: number): Date => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutesAgo)
  return date
}

export const MockSystemMessage: ChatMessage = {
  content: 'Hello! How can I help you today with your research?',
  timestamp: createTimestamp(10),
  type: 'system'
}

export const MockUserMessage: ChatMessage = {
  content: "I'm looking for articles about World War I from Swiss newspapers.",
  timestamp: createTimestamp(8),
  type: 'user'
}

export const MockSystemMessageWithActions: ChatMessage = {
  content:
    'I can help you search for articles about World War I. Let me suggest some filters to narrow down your search.',
  timestamp: createTimestamp(7),
  type: 'system',
  actions: [
    {
      type: 'search',
      context: 'World War I articles from Swiss newspapers'
    },
    {
      type: 'search',
      context: 'Date range: 1914-1918'
    }
  ]
}

export const MockSystemMessageWithToolCalls: ChatMessage = {
  content:
    'I found several newspapers from Switzerland that published articles during World War I. Here are the most relevant ones.',
  timestamp: createTimestamp(5),
  type: 'system',
  toolCalls: ['find_newspapers_ids', 'get_search_facets'],
  reasoning:
    'Using the find_newspapers_ids tool to locate Swiss newspapers that were active during the WWI period, and get_search_facets to understand the distribution of articles across different publications.'
}

export const MockSystemMessageWithSearchSummary: ChatMessage = {
  content: 'Here is a summary of the search results based on your criteria.',
  timestamp: createTimestamp(3),
  type: 'system',
  structuredResponse: {
    searchQuerySummary: 'Searching for: World War I, Date: 1914-1918, Country: Switzerland'
  }
}

export const MockSystemMessageWithAdditionalContent: ChatMessage = {
  content: 'I found relevant information about World War I coverage in Swiss press.',
  timestamp: createTimestamp(2),
  type: 'system',
  additionalContent: `
    <ul>
      <li>Gazette de Lausanne: 1,234 articles</li>
      <li>Journal de Genève: 987 articles</li>
      <li>Neue Zürcher Zeitung: 2,156 articles</li>
    </ul>
  `
}

export const MockToolMessage: ChatMessage = {
  content: 'Executing tool: find_newspapers_ids',
  timestamp: createTimestamp(1),
  type: 'tool',
  toolCalls: ['find_newspapers_ids']
}

export const MockComplexSystemMessage: ChatMessage = {
  content:
    'Based on your search criteria, I recommend applying these filters to get the most relevant results for World War I articles in Swiss newspapers.',
  timestamp: createTimestamp(1),
  type: 'system',
  toolCalls: ['find_newspapers_ids', 'get_search_facets', 'BaristaFormattedResponse'],
  reasoning:
    'First, I identified Swiss newspapers using find_newspapers_ids. Then, I analyzed the search facets with get_search_facets to understand the distribution. Finally, I formatted the response using BaristaFormattedResponse to suggest appropriate filters.',
  actions: [
    {
      type: 'search',
      context: 'Apply date range filter: 1914-1918'
    },
    {
      type: 'search',
      context: 'Apply newspaper filter: Swiss publications'
    }
  ],
  structuredResponse: {
    searchQuerySummary:
      'World War I articles from Swiss newspapers (1914-1918), estimated 5,000+ results'
  },
  additionalContent: `
    <strong>Recommended filters:</strong>
    <ul>
      <li>Date range: 1914-1918</li>
      <li>Language: French, German</li>
      <li>Topics: Military, Politics, International Relations</li>
    </ul>
  `
}

export const MockConversation: ChatMessage[] = [
  MockSystemMessage,
  MockUserMessage,
  MockSystemMessageWithActions,
  {
    content: 'Can you show me the most popular newspapers?',
    timestamp: createTimestamp(6),
    type: 'user'
  },
  MockSystemMessageWithToolCalls,
  {
    content: 'What time period should I focus on?',
    timestamp: createTimestamp(4),
    type: 'user'
  },
  MockComplexSystemMessage
]

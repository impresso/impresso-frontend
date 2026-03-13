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

export const MockSystemMessageWithSearchSteps: ChatMessage = {
  content: 'I have constructed a search query for your request. Here is how I approached it:',
  timestamp: createTimestamp(3),
  type: 'system',
  searchQuerySteps: [
    'Identified the topic "World War I" as the primary search keyword.',
    'Restricted the date range to 1914–1918 to match the conflict period.',
    'Filtered by country: Switzerland, to focus on Swiss press coverage.',
    'Applied language filters for French and German publications.',
    'Sorted results by relevance to surface the most cited articles first.'
  ]
}

export const MockSystemMessageWithSearchStepsAndSummary: ChatMessage = {
  content: 'Search query constructed successfully.',
  timestamp: createTimestamp(2),
  type: 'system',
  structuredResponse: {
    searchQuerySummary:
      'World War I coverage in Swiss newspapers (1914–1918), ~5 000 results expected.'
  },
  searchQuerySteps: [
    'Identified "World War I" as the main topic.',
    'Set date range filter: 1914–1918.',
    'Narrowed results to Swiss newspapers.',
    'Added language constraints: French and German.'
  ]
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
  searchQuerySteps: [
    'Identified "World War I" as the main topic.',
    'Located Swiss newspapers active between 1914 and 1918.',
    'Analysed facet distribution via get_search_facets.',
    'Applied date range filter: 1914–1918.',
    'Formatted results and suggested filters.'
  ],
  additionalContent: `
    <strong>Recommended filters:</strong>
    <ul>
      <li>Date range: 1914-1918</li>
      <li>Language: French, German</li>
      <li>Topics: Military, Politics, International Relations</li>
    </ul>
  `
}

/**
 * A conversation where tool calls in AI messages are stitched to their tool result messages.
 * The AI message at step 2 has toolCallIds that match the tool message at step 3,
 * so the "ordering tools" section should be hidden in step 2.
 */
export const MockConversationWithToolStitching: ChatMessage[] = [
  {
    content: 'Hello! How can I help you today with your research?',
    timestamp: createTimestamp(10),
    type: 'system'
  },
  {
    content: "Find Swiss newspapers from World War I",
    timestamp: createTimestamp(8),
    type: 'user'
  },
  {
    content: '',
    timestamp: createTimestamp(7),
    type: 'system',
    toolCalls: ['find_newspapers_ids', 'get_search_facets'],
    toolCallIds: ['call_abc123', 'call_def456'],
    reasoning: 'I will use find_newspapers_ids to locate Swiss newspapers active during WWI, then get_search_facets to understand the article distribution.'
  },
  {
    content: '[find_newspapers_ids] [ "Switzerland", { "count": 12 } ]',
    timestamp: createTimestamp(6),
    type: 'tool',
    toolCallIds: ['call_abc123']
  },
  {
    content: '[get_search_facets] [ "1914-1918", { "total": 4823 } ]',
    timestamp: createTimestamp(5),
    type: 'tool',
    toolCallIds: ['call_def456']
  },
  {
    content: 'I found 12 Swiss newspapers active during World War I with approximately 4,823 articles between 1914 and 1918.',
    timestamp: createTimestamp(4),
    type: 'system',
    structuredResponse: {
      searchQuerySummary: 'Swiss WWI newspapers (1914–1918), 4,823 articles'
    }
  }
]

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

import { toSerializedFilters } from '@/logic/filters'
import type { AdditionalKwargs, BaristaMessage, ChatMessage } from '@/services/types/barista'

export const getSearchFiltersAsBase64 = (kwargs: AdditionalKwargs): string | undefined => {
  const filtersToolCalls =
    kwargs.tool_calls?.filter?.(
      tool_call => tool_call.type === 'function' && tool_call.function.name === 'Filters'
    ) ?? []

  if (filtersToolCalls.length > 0) {
    try {
      const searchFilters = JSON.parse(filtersToolCalls[0].function.arguments)
      const serializedFilters = toSerializedFilters(searchFilters['filters'])
      return serializedFilters
    } catch (error) {
      console.error('Error parsing search filters:', error)
      return undefined
    }
  }
  return undefined
}

const ChatTypeConverter: Record<BaristaMessage['type'], ChatMessage['type']> = {
  ai: 'system',
  human: 'user'
}

export const ExtraContentSeparator = '---'
// Convert service message to panel message format
export const convertServiceMessageToPanel = (message: BaristaMessage): ChatMessage | undefined => {
  if (!Object.keys(ChatTypeConverter).includes(message.type)) return undefined
  const searchFilters = message.additional_kwargs
    ? getSearchFiltersAsBase64(message.additional_kwargs)
    : undefined
  return {
    content: message.content,
    timestamp: new Date(),
    type: ChatTypeConverter[message.type],
    actions: searchFilters
      ? [
          {
            type: 'search',
            context: searchFilters
          }
        ]
      : undefined
  }
}

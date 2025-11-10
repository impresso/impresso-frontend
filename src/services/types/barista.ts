import { toSerializedFilters } from '@/logic/filters'
import { ClientService } from '@feathersjs/feathers'

interface FunctionCall {
  arguments: string
  name: string
}

export interface ToolCall {
  id: string
  function: FunctionCall
  type: 'function'
}

export interface AdditionalKwargs {
  tool_calls?: ToolCall[]
}

// Main Message Interface
export interface BaristaMessage {
  content: string
  additional_kwargs?: AdditionalKwargs
  type: 'ai' | 'human'
  name?: string | null
  id?: string
}

export interface BaristaRequest {
  message: string
}

interface BaristaResponse {
  messages: BaristaMessage[]
}

export type BaristaService = Pick<
  ClientService<BaristaResponse, BaristaRequest, unknown, unknown>,
  'create'
>

export const getSearchFilters = (kwargs: AdditionalKwargs): any[] => {
  const filtersToolCalls =
    kwargs.tool_calls?.filter?.(
      tool_call => tool_call.type === 'function' && tool_call.function.name === 'Filters'
    ) ?? []

  if (filtersToolCalls.length > 0) {
    try {
      const searchFilters = JSON.parse(filtersToolCalls[0].function.arguments)
      return searchFilters['filters']
    } catch (error) {
      console.error('Error parsing search filters:', error)
      return []
    }
  }
  return []
}

export const getSearchFiltersAsBase64 = (kwargs: AdditionalKwargs): string | undefined => {
  const searchFilters = getSearchFilters(kwargs)
  try {
    const serializedFilters = toSerializedFilters(searchFilters)
    return serializedFilters
  } catch (error) {
    console.error('Error serializing search filters:', error)
    return undefined
  }
  // const filtersToolCalls =
  //   kwargs.tool_calls?.filter?.(
  //     tool_call => tool_call.type === 'function' && tool_call.function.name === 'Filters'
  //   ) ?? []

  // if (filtersToolCalls.length > 0) {
  //   try {
  //     const searchFilters = getSearchFilters(JSON.parse(filtersToolCalls[0].function.arguments))const serializedFilters = toSerializedFilters
  //     const serializedFilters = toSerializedFilters(searchFilters['filters'])
  //     return serializedFilters
  //   } catch (error) {
  //     console.error('Error parsing search filters:', error)
  //     return undefined
  //   }
  // }
  // return undefined
}

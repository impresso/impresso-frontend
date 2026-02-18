import { ClientService } from '@feathersjs/feathers'
import type { components } from '@/models/generated/barista/schema'

export type AIMessage = components['schemas']['AIMessage']
export type HumanMessage = components['schemas']['HumanMessage']
export type ToolMessage = components['schemas']['ToolMessage']
export type ErrorMessage = components['schemas']['ErrorMessage']

export type BaristaFormattedResponse = components['schemas']['BaristaFormattedResponse']

export type BaristaMessageItem = AIMessage | HumanMessage | ToolMessage | ErrorMessage

export type BaristaRequest = components['schemas']['BaristaRequest']
export type BaristaResponse = components['schemas']['BaristaResponse']

export interface FunctionCall {
  arguments: string
  name: string
}

export interface ToolCall {
  id: string
  function: FunctionCall
  type: 'function'
}

export const supportsStructuredResponse = (
  message: BaristaMessageItem
): message is AIMessage | ToolMessage => {
  return message.type === 'ai' || message.type === 'tool'
}

export interface Action {
  type: 'search' | 'text-reuse' | 'images'
  context: string
}

export interface ChatMessage {
  content: string
  timestamp: Date
  type: 'user' | 'system' | 'tool' | 'error'
  actions?: Action[]
  reasoning?: string
  toolCalls?: string[]
  structuredResponse?: BaristaFormattedResponse
  additionalContent?: string
}

export type BaristaService = Pick<
  ClientService<BaristaResponse, BaristaRequest, unknown, unknown>,
  'create'
>

export type SupportedModels = BaristaRequest['modelId']

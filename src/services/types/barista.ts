import { ClientService } from '@feathersjs/feathers'
import type { components } from '@/models/generated/barista/schema'

export type AIMessage = components['schemas']['AIMessage']
export type HumanMessage = components['schemas']['HumanMessage']
export type ToolMessage = components['schemas']['ToolMessage']
export type BaristaFormattedResponse = components['schemas']['BaristaFormattedResponse']
export type BaristaMessageItem = AIMessage | HumanMessage | ToolMessage

export interface FunctionCall {
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

export interface BaristaResponse {
  messages: BaristaMessage[]
}

interface Action {
  type: 'search'
  context: string
}

export interface ChatMessage {
  content: string
  timestamp: Date
  type: 'user' | 'system' | 'tool'
  actions?: Action[]
  reasoning?: string
  toolCalls?: string[]
  structuredResponse?: BaristaFormattedResponse
}

export type BaristaService = Pick<
  ClientService<BaristaResponse, BaristaRequest, unknown, unknown>,
  'create'
>

import { toSerializedFilters } from '@/logic/filters'
import {
  Action,
  BaristaFormattedResponse,
  supportsStructuredResponse,
  type BaristaMessageItem
} from '@/services/types/barista'

const SearchQueryDestinationToService: Record<
  BaristaFormattedResponse['searchQueryDestination'],
  Action['type']
> = {
  content_items: 'search',
  text_reuse: 'text-reuse',
  images: 'images'
}

export const getFiltersAndSearchDestination = (
  message: BaristaMessageItem
): [BaristaFormattedResponse['searchQuery']['filters'], Action['type']] | undefined => {
  if (supportsStructuredResponse(message)) {
    const filters = message.structuredResponse?.searchQuery?.filters
    const searchDestination =
      SearchQueryDestinationToService[
        message.structuredResponse?.searchQueryDestination ?? 'content_items'
      ]
    return [filters, searchDestination]
  }
  return undefined
}

export const ExtraContentSeparator = '---'

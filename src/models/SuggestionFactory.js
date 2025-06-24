import SuggestionMention from '@/models/SuggestionMention'
import SuggestionDaterange from '@/models/SuggestionDaterange'
import FilterString from '@/models/FilterString'
import SuggestionRegex from '@/models/SuggestionRegex'
import SuggestionTopic from '@/models/SuggestionTopic'
import SuggestionCollection from '@/models/SuggestionCollection'
import SuggestionItem from '@/models/SuggestionItem'

export default {
  create: data => {
    switch (data.type) {
      case 'person':
      case 'location':
      case 'entity':
        return new SuggestionItem({
          ...data,
          type: data.type
        })
      case 'mention':
        return new SuggestionMention({
          ...data,
          type: 'mention'
        })
      case 'string':
      case 'title':
        return new FilterString(data)
      case 'daterange':
        return new SuggestionDaterange(data)
      case 'regex':
        return new SuggestionRegex(data)
      case 'topic':
        return new SuggestionTopic(data)
      case 'collection':
        return new SuggestionCollection(data)
      case 'newspaper':
        return new SuggestionItem(data)
      default:
        console.error(`no case for ${data.type}`, data)
        return null
    }
  }
}

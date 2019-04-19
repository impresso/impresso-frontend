import SuggestionMention from '@/models/SuggestionMention';
import SuggestionDaterange from '@/models/SuggestionDaterange';
import FilterString from '@/models/FilterString';
import SuggestionRegex from '@/models/SuggestionRegex';
import SuggestionTopic from '@/models/SuggestionTopic';
import SuggestionCollection from '@/models/SuggestionCollection';


export default {
  create: (data) => {
    if (data.type === 'person' || data.type === 'location') {
      return new SuggestionMention({
        ...data,
        type: 'entity',
      });
    } else if (data.type === 'daterange') {
      return new SuggestionDaterange(data);
    } else if (data.type === 'string') {
      console.log('SuggestionFactory -> FilterString', data);
      return new FilterString(data);
    } else if (data.type === 'regex') {
      return new SuggestionRegex(data);
    } else if (data.type === 'topic') {
      return new SuggestionTopic(data);
    } else if (data.type === 'collection') {
      return new SuggestionCollection(data);
    }
    // else if (data.item) {
    //   return new SuggestionItem(data);
    // }
    return null;
  },
};

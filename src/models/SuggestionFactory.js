import SuggestionMention from '@/models/SuggestionMention';
import SuggestionDaterange from '@/models/SuggestionDaterange';
import SuggestionString from '@/models/SuggestionString';
import SuggestionRegex from '@/models/SuggestionRegex';

export default {
  create: (data) => {
    if (data.type === 'person' || data.type === 'location') {
      return new SuggestionMention({
        ...data,
        type: 'mention',
      });
    } else if (data.type === 'daterange') {
      return new SuggestionDaterange(data);
    } else if (data.type === 'string') {
      return new SuggestionString(data);
    } else if (data.type === 'regex') {
      return new SuggestionRegex(data);
    }

    return null;
  },
};

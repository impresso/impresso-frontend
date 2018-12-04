import Suggestion from '@/models/Suggestion';

export default {
  create: (suggestionData) => {
    let suggestion = false;

    if (suggestionData.type === 'newspaper') {
      suggestion = new Suggestion({
        ...suggestionData,
        newspaper: suggestionData.item,
      });
    } else if (suggestionData.type === 'entity') {
      suggestion = new Suggestion({
        ...suggestionData,
        entity: suggestionData.entity,
      });
    } else {
      // simple string ?
      suggestion = new Suggestion(suggestionData);
    }

    return suggestion;
  },
};

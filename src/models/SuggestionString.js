import Suggestion from '@/models/Suggestion';

export default class SuggestionString extends Suggestion {
  constructor(args) {
    super(args);

    this.query = args.query;
  }
}

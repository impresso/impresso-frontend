import Suggestion from '@/models/SuggestionBase';

export default class SuggestionString extends Suggestion {
  constructor(args) {
    super(args);

    this.query = args.query;
  }
}

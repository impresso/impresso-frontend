import Suggestion from '@/models/SuggestionBase';

export default class SuggestionRegex extends Suggestion {
  constructor(args) {
    super(args);

    this.query = args.q;
  }
}

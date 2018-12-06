import Suggestion from '@/models/Suggestion';

export default class SuggestionRegex extends Suggestion {
  constructor(args) {
    super(args);

    this.query = args.q;
  }
}

import Suggestion from '@/models/SuggestionBase';

export default class SuggestionTopic extends Suggestion {
  constructor(args) {
    super(args);

    this.h = String(args.h);
    this.item = args.item;
    this.precision = String(args.precision);
    this.q = String(args.q);
  }
}

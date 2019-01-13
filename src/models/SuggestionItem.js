import Suggestion from '@/models/SuggestionBase';

export default class SuggestionItem extends Suggestion {
  constructor(args) {
    super(args);
    this.item = args.item;
    this.h = String(args.h);
  }
}

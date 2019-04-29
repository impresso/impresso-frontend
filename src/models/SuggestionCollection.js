import Suggestion from '@/models/SuggestionBase';
import Collection from '@/models/Collection';

export default class SuggestionCollection extends Suggestion {
  constructor(args) {
    super(args);
    this.h = String(args.h);
    this.item = new Collection(args.item);
    this.precision = String(args.precision);
    this.q = String(args.q);
  }
}

import Suggestion from '@/models/SuggestionBase';
import Topic from '@/models/Topic';

export default class SuggestionTopic extends Suggestion {
  constructor(args) {
    super(args);

    this.h = String(args.h);
    this.item = new Topic(args.item);
    this.precision = String(args.precision);
    this.q = String(args.q);
  }
}

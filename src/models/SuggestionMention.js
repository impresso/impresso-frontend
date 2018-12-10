import Suggestion from '@/models/SuggestionBase';

export default class SuggestionMention extends Suggestion {
  constructor(args) {
    super(args);

    this.item = {
      frequence: parseInt(args.item.frequence, 10),
      name: String(args.item.name),
      type: String(args.item.type),
    };

    this.h = String(args.h);
  }
}

import Suggestion from '@/models/Suggestion';
import Daterange from '@/models/Daterange';

export default class SuggestionDaterange extends Suggestion {
  constructor(args) {
    super(args);

    this.daterange = new Daterange(args);
  }
}

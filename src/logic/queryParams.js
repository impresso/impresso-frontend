import SearchQuery from '@/models/SearchQuery'
import {
  getLatestSerializedSearchQuery,
  setLatestSerializedSearchQuery
} from './storage'


export const searchQueryHashGetter = () => function() {
  const { sq } = this.$route?.query;
  if (sq) {
    return sq;
  }

  const storedSq = getLatestSerializedSearchQuery()
  if (storedSq) {
    return storedSq;
  }
  return '';
};

export const searchQueryGetter = () => {
  const get = function() {
    const { sq } = this.$route?.query;
    if (sq) {
      return SearchQuery.deserialize(sq);
    }
    const storedSq = getLatestSerializedSearchQuery()
    if (storedSq) {
      return SearchQuery.deserialize(storedSq);
    }
    return new SearchQuery();
  }
  return { get };
};

export const searchQuerySetter = ({ additionalQueryParams = {} } = {}) => {
  const set = function(searchQuery) {
    // update searchquery in the store so that the current sq
    // hash in the local storage gets updated, too.
    const sq = searchQuery.getSerialized({ serializer: 'protobuf' });
    setLatestSerializedSearchQuery(sq)
    this.$navigation.updateQueryParametersWithHistory({
      ...additionalQueryParams,
      sq,
    });
  }
  return { set };
};

export const syncSearchQuery = () => ({
  ...searchQueryGetter,
  ...searchQuerySetter,
});

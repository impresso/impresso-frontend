import SearchQuery from '@/models/SearchQuery'
import {
  getLatestSerializedSearchQuery,
  setLatestSerializedSearchQuery
} from './storage'

const getSqFromRoute = (route) => {
  const { sq } = route?.query;
  if (sq) {
    return sq;
  }
  const storedSq = getLatestSerializedSearchQuery()
  if (storedSq) {
    return storedSq;
  }
  return '';
}

export const searchQueryHashGetter = () => function() {
  return getSqFromRoute(this.$route);
};

export const searchQueryGetter = () => {
  const get = function() {
    const sq = getSqFromRoute(this.$route);
    if (sq.length) {
      return SearchQuery.deserialize(sq);
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

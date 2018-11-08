import FilterEntity from '@/models/FilterEntity';
import FilterString from '@/models/FilterString';
import FilterRegex from '@/models/FilterRegex';
import FilterFacet from '@/models/FilterFacet';
import FilterFacetYear from '@/models/FilterFacetYear';

import uuid from 'uuid';

export default {
  create: (filterData) => {
    let filter = false;

    if (filterData.type === 'string') {
      filter = new FilterString(filterData);
    }

    if (filterData.type === 'regex') {
      filter = new FilterRegex(filterData);
    }

    if (filterData.type === 'entity') {
      filter = new FilterEntity(filterData);
    }

    if (filterData.type === 'language' || filterData.type === 'newspaper') {
      filter = new FilterFacet(filterData);
    }

    if (filterData.type === 'year') {
      filter = new FilterFacetYear(filterData);
    }

    if (filter) {
      filter.key = filterData.key || uuid.v4();
      return filter;
    }

    return null;
  },
};

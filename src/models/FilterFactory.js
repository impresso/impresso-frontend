import FilterBoolean from '@/models/FilterBoolean';
import FilterEntity from '@/models/FilterEntity';
import FilterString from '@/models/FilterString';
import FilterRegex from '@/models/FilterRegex';
import FilterNewspaper from '@/models/FilterNewspaper';
import FilterTopic from '@/models/FilterTopic';
import FilterLanguage from '@/models/FilterLanguage';
import FilterFacetYear from '@/models/FilterFacetYear';
import FilterDaterange from '@/models/FilterDaterange';
import FilterCollection from '@/models/FilterCollection';

import uuid from 'uuid';

export default {
  create: (filterData) => {
    let filter = false;

    if (filterData.type === 'mention') {
      filter = new FilterString({
        ...filterData,
        type: 'string', // we force string filter
        precision: 'EXACT',
        query: filterData.item.name,
      });
    }

    if (filterData.type === 'string') {
      filter = new FilterString(filterData);
    }

    if (['isFront', 'hasTextContents'].indexOf(filterData.type) > -1) {
      filter = new FilterBoolean(filterData);
    }

    if (filterData.type === 'regex') {
      filter = new FilterRegex(filterData);
    }

    if (filterData.type === 'entity') {
      filter = new FilterEntity(filterData);
    }

    if (filterData.type === 'language') {
      filter = new FilterLanguage(filterData);
    }

    if (filterData.type === 'newspaper') {
      filter = new FilterNewspaper(filterData);
    }

    if (filterData.type === 'topic') {
      filter = new FilterTopic(filterData);
    }

    if (filterData.type === 'year') {
      filter = new FilterFacetYear(filterData);
    }

    if (filterData.type === 'daterange') {
      filter = new FilterDaterange(filterData);
    }

    if (filterData.type === 'collection') {
      filter = new FilterCollection(filterData);
    }

    if (filter) {
      filter.key = filterData.key || uuid.v4();
      return filter;
    }
    throw new Error(`Cannot create filter for type: ${filterData.type}`);
  },
};

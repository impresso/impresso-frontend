import FilterBoolean from '@/models/FilterBoolean';
import FilterEntity from '@/models/FilterEntity';
import FilterString from '@/models/FilterString';
import FilterRegex from '@/models/FilterRegex';
import FilterNewspaper from '@/models/FilterNewspaper';
import FilterTopic from '@/models/FilterTopic';
import FilterItem from '@/models/FilterItem';
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

    if (filterData.type === 'title') {
      filter = new FilterString({
        ...filterData,
        type: 'title',
      });
    }

    if (['isFront', 'hasTextContents'].indexOf(filterData.type) > -1) {
      filter = new FilterBoolean(filterData);
    }

    if (filterData.type === 'regex') {
      filter = new FilterRegex(filterData);
    }

    if (['entity', 'person', 'location'].indexOf(filterData.type) !== -1) {
      filter = new FilterEntity(filterData);
    }

    if (['country', 'type', 'language', 'issue'].includes(filterData.type)) {
      filter = new FilterItem(filterData);
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

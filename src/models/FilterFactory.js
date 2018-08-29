import FilterEntity from '@/models/FilterEntity';
import FilterString from '@/models/FilterString';
import uuid from 'uuid';

export default {
  create: (filterData) => {
    let filter = false;

    if (filterData.type === 'string') {
      filter = new FilterString(filterData);
    }

    if (filterData.type === 'entity') {
      filter = new FilterEntity(filterData);
    }

    if (filter) {
      filter.key = filterData.key || uuid.v4();
      return filter;
    }

    return null;
  },
};

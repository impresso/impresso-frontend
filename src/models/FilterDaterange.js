import FilterItems from '@/models/FilterItems';
import Daterange from '@/models/Daterange';

/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} entity Entity object
 */

export default class FilterDaterange extends FilterItems {
  constructor(args) {
    super(args);
    if (!this.items.length) {
      this.items = this.q.map((daterange) => {
        console.log('creating', daterange);
        const d = new Daterange({ daterange });
        d.uid = d.getValue();
        d.checked = true;
        return d;
      });
    }
  }

  // getQuery() {
  //   const query = {
  //     type: this.type,
  //     q: this.items.map(d => d.getValue()),
  //   };
  //   if (this.context !== 'include') {
  //     query.context = this.context;
  //   }
  //   return query;
  // }

  setItems(items = []) {
    console.log('daterange setItems', items);
    this.items = items;
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }


  // constructor({
  //   type = 'daterange',
  //   context = 'include',
  //   start = null,
  //   end = null,
  //   daterange = '',
  //   items = [],
  // } = {}) {
  //   super({
  //     type,
  //     context,
  //   });
  //
  //   if (!items.length) {
  //     const dr = new Daterange({
  //       start,
  //       end,
  //       daterange,
  //     });
  //     dr.checked = true;
  //     this.items = [dr];
  //     this.q = [dr.getValue()];
  //   }
  //   console.log('FilterDaterange loaded daterange', this.daterange);
  // }
  //
  // setItems(items = []) {
  //   console.log('FilterDaterange setItems', items);
  //   this.q = [];
  //   this.items = items.map((daterange) => {
  //     const d = new Daterange({ daterange });
  //     d.checked = true;
  //     this.q.push(d.getValue());
  //     return d;
  //   });
  // }
  //
  //
}

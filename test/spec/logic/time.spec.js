import { describe, test as it } from 'vitest'
import assert from 'assert';
import { withMissingDates } from '../../../src/logic/time'

describe('withMissingDates', () => {
  const testGetDateFn = item => new Date(item)
  const testFillItemFn = date => date.toISOString().split('T')[0]

  it('fills in empty years', () => {
    const items = [
      '2014-01-01',
      '2017-01-01',
      '2018-01-01',
      '2020-01-01'
    ]
    const expectedItems = [
      '2014-01-01',
      '2015-01-01',
      '2016-01-01',
      '2017-01-01',
      '2018-01-01',
      '2019-01-01',
      '2020-01-01'
    ]
    const fullItems = withMissingDates(items, 'year', testGetDateFn, testFillItemFn)
    assert.deepEqual(fullItems, expectedItems)
  })

  it('fills in empty months', () => {
    const items = [
      '2014-08-01',
      '2014-10-01',
      '2015-02-01',
    ]
    const expectedItems = [
      '2014-08-01',
      '2014-09-01',
      '2014-10-01',
      '2014-11-01',
      '2014-12-01',
      '2015-01-01',
      '2015-02-01',
    ]
    const fullItems = withMissingDates(items, 'month', testGetDateFn, testFillItemFn)
    assert.deepEqual(fullItems, expectedItems)
  })

  it('fills in empty days', () => {
    const items = [
      '2014-02-27',
      '2014-03-01',
    ]
    const expectedItems = [
      '2014-02-27',
      '2014-02-28',
      '2014-03-01',
    ]
    const fullItems = withMissingDates(items, 'day', testGetDateFn, testFillItemFn)
    assert.deepEqual(fullItems, expectedItems)
  })

  it('sorts and fills in empty days', () => {
    const items = [
      '2014-03-01',
      '2014-02-27',
    ]
    const expectedItems = [
      '2014-02-27',
      '2014-02-28',
      '2014-03-01',
    ]
    const fullItems = withMissingDates(items, 'day', testGetDateFn, testFillItemFn)
    assert.deepEqual(fullItems, expectedItems)
  })

  it('returns empty array', () => {
    const items = [
    ]
    const expectedItems = [
    ]
    const fullItems = withMissingDates(items, 'day', testGetDateFn, testFillItemFn)
    assert.deepEqual(fullItems, expectedItems)
  })
})

import assert from 'assert'
import findIndex from '../../lib/utils/findIndex'

describe('findIndex', () => {
  it('should work without params', () => {
    assert.equal(findIndex(), -1)
  })

  it('should work with empty array', () => {
    assert.equal(findIndex([]), -1)
  })

  it('should work with default identity function', () => {
    assert.equal(findIndex([false, true]), 1)
  })

  it('should work with no matches', () => {
    assert.equal(findIndex([1, 2, 3], x => x === 4), -1)
  })
})

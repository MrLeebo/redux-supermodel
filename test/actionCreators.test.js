/* global $subject */
import assert from 'assert'
import { resourceActionCreators } from '../lib/actionCreators'
import propType from '../lib/propType'

describe('actionCreators', () => {
  const baseUrl = 'http://localhost'

  def('subject', () => resourceActionCreators(baseUrl, 'blogs', { url: 'blogs' }))

  it('should require resource', () => {
    assert.throws(resourceActionCreators, 'Resource definition required')
  })

  it('should require url', () => {
    const msg = 'Invalid resource definition: Missing required field or function "url" or "urlRoot"'
    assert.throws(() => resourceActionCreators(baseUrl, null, {}), msg)
  })

  it('should generate action creators', () => {
    const actions = ['reset', 'fetch', 'create', 'update', 'destroy']
    actions.forEach(action => assert.equal(typeof $subject[action], 'function'))
  })

  it('should include propType', () => {
    assert.equal($subject.propType, propType)
  })
})

import assert from 'assert'
import { resourceActionCreators } from '../lib/actionCreators'

describe('actionCreators', () => {
  let subject
  const baseUrl = 'http://localhost'

  it('should require resource', () => {
    assert.throws(resourceActionCreators, 'Resource definition required')
  })

  it('should require url', () => {
    const msg = 'Invalid resource definition: Missing required field or function "url" or "urlRoot"'
    assert.throws(() => resourceActionCreators(baseUrl, null, {}), msg)
  })

  it('should generate action creators', () => {
    const actions = ['reset', 'fetch', 'create', 'update', 'destroy']
    subject = resourceActionCreators(baseUrl, 'blogs', { url: 'blogs' })

    assert.deepEqual(Object.keys(subject), actions)
    actions.forEach(action => assert.equal(typeof subject[action], 'function'))
  })
})

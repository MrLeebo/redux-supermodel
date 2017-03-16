/* global $subject, $agent */
import assert from 'assert'

import request from './fixtures/axiosTest'
import app from './fixtures/app'

import { resourceActionCreators } from '../lib/actionCreators'
import propType from '../lib/propType'

describe('actionCreators', () => {
  const baseUrl = '/'

  def('subject', () => resourceActionCreators(baseUrl, 'blogs', { urlRoot: 'blogs' }, { agent: $agent }))
  def('agent', () => request(app))

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

  describe('ajaxActionCreator', () => {
    it('should include params in url for GET', async function () {
      const result = await $subject.fetch({ fizz: 'buzz' }).payload
      assert.equal(result.request._options.path, '/blogs?fizz=buzz')
    })

    it('should not include id attribute in params', async function () {
      const result = await $subject.fetch({ id: 'my-first-blog', sort: 'popular' }).payload
      assert.equal(result.request._options.path, '/blogs/my-first-blog?sort=popular')
      assert.deepEqual(result.data, { id: 'my-first-blog' })
    })
  })
})

/* global $subject, $agent, $blogs */
import assert from 'assert'

import request from './fixtures/axiosTest'
import app from './fixtures/app'

import { resourceActionCreators } from '../lib/actionCreators'
import propType from '../lib/propType'

describe('actionCreators', () => {
  const baseUrl = '/'

  subject(() => resourceActionCreators(baseUrl, 'blogs', $blogs, { agent: $agent }))
  def('agent', () => request(app))
  def('blogs', () => ({ urlRoot: 'blogs' }))

  function assertPath (result, expected) {
    assert.equal(result.request._options.path, expected)
  }

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
    it('should build simple url', async function () {
      const result = await $subject.fetch().payload
      assertPath(result, '/blogs')
    })

    it('should include params in url for GET', async function () {
      const result = await $subject.fetch({ fizz: 'buzz' }).payload
      assertPath(result, '/blogs?fizz=buzz')
    })

    it('should not include id attribute in params', async function () {
      const result = await $subject.fetch({ id: 'my-first-blog', sort: 'popular' }).payload
      assertPath(result, '/blogs/my-first-blog?sort=popular')
      assert.deepEqual(result.data, { id: 'my-first-blog' })
    })

    describe('with root param', () => {
      def('blogs', () => ({ url: 'blogs', rootParam: true }))

      it('should ignore root param', async function () {
        const result = await $subject.fetch({ sort: 'popular' }).payload
        assertPath(result, '/blogs?sort=popular')
      })
    })
  })
})

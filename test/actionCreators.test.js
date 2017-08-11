/* global $subject, $agent, $auth, $before, $blogs */
import assert from 'assert'

import request from './fixtures/axiosTest'
import app from './fixtures/app'

import { resourceActionCreators, nuke } from '../lib/actionCreators'
import * as types from '../lib/actionTypes'
import propType from '../lib/propType'

describe('actionCreators', () => {
  const baseUrl = '/'

  subject(() => resourceActionCreators(baseUrl, 'blogs', $blogs, { agent: $agent, before: $before }))
  def('agent', () => request(app))
  def('before', () => undefined)
  def('blogs', () => ({ urlRoot: 'blogs' }))

  function assertPath (result, expected) {
    assert.equal(result.request.path, expected)
  }

  function assertRequestBody (result, expected) {
    assert.deepEqual(JSON.parse(result.config.data), expected)
  }

  function assertAuth (result, expected) {
    assert.deepEqual(result.config.auth, expected)
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

      it('should apply root param', async function () {
        const blogs = { title: 'my blog' }
        const result = await $subject.create(blogs).payload

        assertRequestBody(result, { blogs })
      })

      it('should ignore synthetic events', async () => {
        const result = await $subject.fetch({ nativeEvent: {} }).payload
        assertPath(result, '/blogs')
      })
    })

    describe('with root param string', () => {
      def('blogs', () => ({ url: 'blogs', rootParam: 'obj' }))

      it('should apply root param', async function () {
        const obj = { title: 'my blog' }
        const result = await $subject.create(obj).payload

        assertRequestBody(result, { obj })
      })
    })

    describe('with before function', () => {
      def('auth', () => ({ username: 'u', password: 'p' }))
      def('before', () => config => ({ ...config, auth: $auth }))

      it('should apply changes', async function () {
        const result = await $subject.fetch().payload
        assertAuth(result, $auth)
      })
    })

    describe('with before action', () => {
      def('before', () => config => {
        config.auth = $auth
      })

      it('should apply changes', async function () {
        const result = await $subject.fetch().payload
        assertAuth(result, $auth)
      })
    })

    describe('with url function', () => {
      def('blogs', () => ({ url: () => 'blogs' }))

      it('should invoke url function', async function () {
        const result = await $subject.fetch().payload
        assertPath(result, '/blogs')
      })
    })

    describe('with urlRoot function', () => {
      def('blogs', () => ({ urlRoot: () => 'blogs', idAttribute: 'key' }))

      it('should invoke urlRoot function', async function () {
        const result = await $subject.fetch({ key: 'latest' }).payload
        assertPath(result, '/blogs/latest')
      })
    })
  })

  describe('nuke', () => {
    it('should create nuke action', () => {
      const { type } = nuke()
      assert.equal(type, types.NUKE)
    })
  })
})

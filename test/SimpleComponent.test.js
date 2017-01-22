/* global $subject, $agent, $component, $map, $resource, $client, $fetch, $create, $prop */
import assert from 'assert'
import { mount } from 'enzyme'

import request from './fixtures/axiosTest'
import simpleComponent from './fixtures/SimpleComponent'
import withConnectContext from './fixtures/withConnectContext'
import store from './fixtures/store'

import app, {
  UNAUTHORIZED,
  AUTHORIZED,
  TODO_ITEM,
  TITLE_REQUIRED
} from './fixtures/app'

import createClient from '../lib/createClient'
import { nuke } from '../lib/actionCreators'

describe('SimpleComponent', () => {
  subject(() => mount(withConnectContext($component)).find('SimpleComponent'))
  def('component', () => simpleComponent($resource, $map))
  def('client', () => createClient({ agent: $agent }))
  def('agent', () => request(app))
  def('fetch', () => $subject.prop('fetch'))
  def('create', () => $subject.prop('create'))
  def('prop', () => $subject.prop('resource'))

  function assertPromiseFailed (reason = "Expected promise to fail but it didn't") {
    // A normal throw would be silently caught by the try/catch block, so return the
    // error wrapped inside a rejected promise.
    return Promise.reject(new Error(reason))
  }

  beforeEach(() => {
    store.dispatch(nuke())
  })

  describe('rendering TODO item', () => {
    def('resource', () => $client('todos', { urlRoot: 'todos' }))
    def('map', () => payload => payload.data.title)

    it('should build url with id', async function () {
      await $fetch({ id: 1 })

      assert($prop.payload.config.url.endsWith('/todos/1'))
      assert.deepEqual($prop.payload.data, TODO_ITEM)
    })

    it('should build url with null id', async function () {
      await $fetch({ id: null })

      assert($prop.payload.config.url.endsWith('/todos'))
    })

    it('should not create undefined', async function () {
      try {
        await $create()
        return assertPromiseFailed()
      } catch (ex) {
        assert.equal($prop.error.response.data, TITLE_REQUIRED)
      }
    })

    it('should not create undefined', async function () {
      try {
        await $create()
        return assertPromiseFailed()
      } catch (ex) {
        assert.equal($prop.error.response.data, TITLE_REQUIRED)
      }
    })

    it('should create', async function () {
      const title = 'add new item'
      await $create({ title })

      assert.equal($prop.payload.data.title, title)
    })
  })

  describe('rendering admin', () => {
    def('resource', () => $client('admin'))
    def('map', () => ({data}) => data)

    it('should not authenticate', async function () {
      try {
        await $fetch()
        return assertPromiseFailed()
      } catch (ex) {
        assert.equal($prop.error.response.data, UNAUTHORIZED)
        assert.equal($subject.find('.error').text(), UNAUTHORIZED)
      }
    })

    describe('with auth token', () => {
      function before (config) {
        const headers = { ...config.headers, 'X-Auth-Token': 'TOKEN' }
        return { ...config, headers }
      }

      def('client', () => createClient({ agent: $agent, before }))

      it('should authenticate', async function () {
        await $fetch()

        assert.equal($prop.payload.data, AUTHORIZED)
        assert.equal($subject.find('#root').text(), AUTHORIZED)
      })
    })
  })
})

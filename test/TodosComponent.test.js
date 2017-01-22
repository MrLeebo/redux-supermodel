/* global $subject, $agent, $component, $resource, $client, $fetch, $reset, $destroy, $prop */
import assert from 'assert'
import { mount } from 'enzyme'

import request from './fixtures/axiosTest'
import todosComponent from './fixtures/TodosComponent'
import withConnectContext from './fixtures/withConnectContext'
import store from './fixtures/store'

import app, {
  TODO_ITEM,
  TODO_LIST
} from './fixtures/app'

import createClient from '../lib/createClient'
import { nuke } from '../lib/actionCreators'

describe('TodosComponent', () => {
  subject(() => mount(withConnectContext($component)).find('TodosComponent'))
  def('component', () => todosComponent($resource))
  def('resource', () => $client('todos'))
  def('client', () => createClient({ agent: $agent }))
  def('agent', () => request(app))
  def('fetch', () => $subject.prop('fetch'))
  def('destroy', () => $subject.prop('destroy'))
  def('reset', () => $subject.prop('reset'))
  def('prop', () => $subject.prop('resource'))

  beforeEach(() => {
    store.dispatch(nuke())
  })

  it('should render', async function () {
    await $fetch()

    assert.equal($subject.find('#root').length, 1)
  })

  it('should update state', async function () {
    assert($subject.find('#loading').text(), 'Please wait...')

    await $fetch()

    assert($subject.find('table').length, 1)
  })

  it('should build default url', async function () {
    await $fetch()

    assert.equal($prop.payload.config.method, 'get')
    assert($prop.payload.config.url.endsWith('/todos'))
  })

  it('should reset', async function () {
    // Reset does not trigger an AJAX request so the component should
    // change directly to the state that was provided
    const payload = { data: [{ id: 1, title: 'reset' }] }
    await $reset(payload)

    assert.equal($subject.find('tr').length, 1)
    assert.equal($subject.find('tr td').text(), 'reset')
  })

  it('should reset undefined', async function () {
    await $reset()

    const { initialized, payload } = $prop
    assert(!initialized)
    assert(!payload)
  })

  it('should fetch', async function () {
    // Before fetching, the component is not ready
    assert($subject.find('#loading').text(), 'Please wait...')

    await $fetch()

    // Verify that the resource data is correct and that the HTML is rendered
    const { busy, payload, previous } = store.getState().resource.todos

    assert(!busy)
    assert.deepEqual(payload.data, TODO_LIST)
    assert.equal(previous, null)

    const propBody = $prop.payload.data
    assert.deepEqual(propBody, TODO_LIST)
    assert.equal($subject.find('tr').length, 4)
  })

  describe('with transform to mark deleted items', () => {
    // Handle deletes by looking for the item with the matching ID and
    // setting `deleted: true` on that item.
    function markDeletesTransformer (payload, previous, isFulfilled, meta) {
      if (!isFulfilled) return previous
      if (meta.action !== 'destroy') return payload

      const { id } = meta.inputData
      let { data } = previous
      const index = data && data.findIndex(x => x.id === id)

      if (index >= 0) {
        data = data.slice(0)
        data[index] = { ...data[index], deleted: true }
        return { ...previous, data }
      }

      return previous
    }

    def('resource', () => {
      return $client('todos', {
        urlRoot: 'todos',
        transform: markDeletesTransformer,
        defaultPayload: { data: [] }
      })
    })

    it('should strikethrough item on delete', async function () {
      await $fetch()

      assert.equal($subject.find('tr').length, 4)

      await $destroy(TODO_ITEM)

      assert.equal($subject.find('del').text(), TODO_ITEM.title)
    })
  })
})

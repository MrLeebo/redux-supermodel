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
  let subject
  let agent
  let client
  let resource

  function render (props = {}) {
    const TodosComponent = todosComponent(resource)
    subject = mount(withConnectContext(TodosComponent, props)).find('TodosComponent')
  }

  function fetch (data) {
    return subject.prop('fetch')(data)
  }

  function destroy (data) {
    return subject.prop('destroy')(data)
  }

  function reset (data) {
    return subject.prop('reset')(data)
  }

  function getResource (prop) {
    return subject.prop('resource')
  }

  function createAgent () {
    agent = request(app)
  }

  function nukeStore () {
    store.dispatch(nuke())
  }

  beforeEach(() => {
    createAgent()
    nukeStore()
  })

  it('should render', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    await fetch()

    assert.equal(subject.find('#root').length, 1)
  })

  it('should update state', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    assert(subject.find('#loading').text(), 'Please wait...')

    await fetch()

    assert(subject.find('table').length, 1)
  })

  it('should build default url', async function () {
    client = createClient({ agent })

    resource = client('todos')
    render()

    await fetch()

    const todos = getResource()

    assert.equal(todos.payload.config.method, 'get')
    assert(todos.payload.config.url.endsWith('/todos'))
  })

  it('should reset', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    // Reset does not trigger an AJAX request so the component should
    // change directly to the state that was provided
    const payload = { data: [{ id: 1, title: 'reset' }] }
    await reset(payload)

    assert.equal(subject.find('tr').length, 1)
    assert.equal(subject.find('tr td').text(), 'reset')
  })

  it('should reset undefined', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    await reset()

    assert.deepEqual(getResource(), {
      busy: false,
      ready: false,
      payload: undefined,
      previous: undefined
    })
  })

  it('should transform delete state to flag', async function () {
    // Handle deletes by looking for the item with the matching ID and
    // setting `deleted: true` on that item.
    function transform (payload, previous, isFulfilled, meta) {
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

    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos', transform })

    render()

    // Set the component data
    await reset({ data: TODO_LIST })

    // Ensure that everything is rendered correctly first
    assert.equal(subject.find('tr').length, 4)

    // Destroy the first item
    await destroy(TODO_ITEM)

    // The deleted item should still be in the HTML with a strikethrough
    assert.equal(subject.find('del').text(), TODO_ITEM.title)
  })

  it('should fetch', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    // Before fetching, the component is not ready
    assert(subject.find('#loading').text(), 'Please wait...')

    await fetch()

    // Verify that the resource data is correct and that the HTML is rendered
    const { busy, payload, previous } = store.getState().resource.todos

    assert(!busy)
    assert.deepEqual(payload.data, TODO_LIST)
    assert.equal(previous, null)

    const propBody = getResource().payload.data
    assert.deepEqual(propBody, TODO_LIST)
    assert.equal(subject.find('tr').length, 4)
  })
})

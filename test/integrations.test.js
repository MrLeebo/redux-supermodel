import assert from 'assert'
import { mount } from 'enzyme'

import request from './fixtures/axiosTest'
import alwaysComponent from './fixtures/AlwaysRendersComponent'
import todosComponent from './fixtures/TodosComponent'
import simpleComponent from './fixtures/SimpleComponent'
import withConnectContext from './fixtures/withConnectContext'
import store from './fixtures/store'

import app, {
  UNAUTHORIZED,
  AUTHORIZED,
  TODO_ITEM,
  TODO_LIST,
  FORTUNE
} from './fixtures/app'

import createClient from '../lib/createClient'
import { nuke } from '../lib/actionCreators'

describe('integrations', () => {
  let subject
  let agent
  let client
  let resource

  function renderAlways (props = {}) {
    const AlwaysRendersComponent = alwaysComponent(resource)
    subject = mount(withConnectContext(AlwaysRendersComponent, props)).find('AlwaysRendersComponent')
  }

  function renderTodos (props = {}) {
    const TodosComponent = todosComponent(resource)
    subject = mount(withConnectContext(TodosComponent, props)).find('TodosComponent')
  }

  function renderSimple (map) {
    const SimpleComponent = simpleComponent(resource, map)
    subject = mount(withConnectContext(SimpleComponent)).find('SimpleComponent')
  }

  function fetch (data) {
    return subject.prop('fetch')(data)
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

  it('should build url with id', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    renderSimple(payload => payload.data.title)

    await fetch({ id: 1 })

    const todos = getResource()
    assert(todos.payload.config.url.endsWith('/todos/1'))
    assert.deepEqual(todos.payload.data, TODO_ITEM)
  })

  it('should render', async function () {
    client = createClient({ agent })
    resource = client('todos')
    renderTodos()

    await fetch()

    assert.equal(subject.find('#root').length, 1)
  })

  it('should update state', async function () {
    client = createClient({ agent })
    resource = client('todos')
    renderTodos()

    assert(subject.find('#loading').text(), 'Please wait...')

    await fetch()

    assert(subject.find('table').length, 1)
  })

  it('should build default url', async function () {
    client = createClient({ agent })

    resource = client('todos')
    renderTodos()

    await fetch()

    const todos = getResource()

    assert.equal(todos.payload.config.method, 'get')
    assert(todos.payload.config.url.endsWith('/todos'))
  })

  it('should build url with null id', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    renderSimple(payload => payload.data.title)

    await fetch({ id: null })

    const todos = getResource()
    assert(todos.payload.config.url.endsWith('/todos'))
  })

  it('should reset', async function () {
    client = createClient({ agent })
    resource = client('todos')
    renderTodos()

    const payload = { data: [{ title: 'reset' }] }
    await reset(payload)

    assert.equal(subject.find('tr').length, 1)
    assert.equal(subject.find('tr td').text(), 'reset')
  })

  it('should fetch', async function () {
    client = createClient({ agent })
    resource = client('todos')
    renderTodos()

    assert(subject.find('#loading').text(), 'Please wait...')

    await fetch()

    const { busy, payload, previous } = store.getState().resource.todos

    assert(!busy)
    assert.deepEqual(payload.data, TODO_LIST)
    assert.equal(previous, null)

    const propBody = getResource().payload.data
    assert.deepEqual(propBody, TODO_LIST)
    assert.equal(subject.find('tr').length, 4)
  })

  it('should not authenticate', async function () {
    client = createClient({ agent })
    resource = client('admin')
    renderSimple()

    try {
      await fetch()
    } catch (ex) {
      const admin = getResource()
      assert.equal(admin.error.response.data, UNAUTHORIZED)
      assert.equal(subject.find('.error').text(), UNAUTHORIZED)
    }
  })

  it('should authenticate', async function () {
    function before (config) {
      const headers = { ...config.headers, 'X-Auth-Token': 'TOKEN' }
      return { ...config, headers }
    }

    client = createClient({ agent, before })
    resource = client('admin')
    renderSimple()

    await fetch()

    const admin = getResource()
    assert.equal(admin.payload.data, AUTHORIZED)
    assert.equal(subject.find('#root').text(), AUTHORIZED)
  })

  it('should use default value before fetch', async function () {
    client = createClient({ agent })
    const data = 'not fetched'
    resource = client('fortunecookie', { defaultPayload: { data } })

    renderAlways()

    assert.equal(subject.find('#root').text(), data)

    await fetch()

    assert.equal(subject.find('#root').text(), FORTUNE)
  })
})

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
  let subject
  let agent
  let client
  let resource

  function render (map) {
    const SimpleComponent = simpleComponent(resource, map)
    subject = mount(withConnectContext(SimpleComponent)).find('SimpleComponent')
  }

  function fetch (data) {
    return subject.prop('fetch')(data)
  }

  function create (data) {
    return subject.prop('create')(data)
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

  function assertPromiseFailed (reason = "Expected promise to fail but it didn't") {
    // A normal throw would be silently caught by the try/catch block, so return the
    // error wrapped inside a rejected promise.
    return Promise.reject(new Error(reason))
  }

  beforeEach(() => {
    createAgent()
    nukeStore()
  })

  it('should build url with id', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    render(payload => payload.data.title)

    await fetch({ id: 1 })

    const todos = getResource()
    assert(todos.payload.config.url.endsWith('/todos/1'))
    assert.deepEqual(todos.payload.data, TODO_ITEM)
  })

  it('should build url with null id', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    render(payload => payload.data.title)

    await fetch({ id: null })

    const todos = getResource()
    assert(todos.payload.config.url.endsWith('/todos'))
  })

  it('should not create undefined', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    render(payload => payload.data.title)

    try {
      await create()
      return assertPromiseFailed()
    } catch (ex) {
      const todo = getResource()
      assert.equal(todo.error.response.data, TITLE_REQUIRED)
    }
  })

  it('should not create undefined', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    render(payload => payload.data.title)

    try {
      await create()
      return assertPromiseFailed()
    } catch (ex) {
      const todo = getResource()
      assert.equal(todo.error.response.data, TITLE_REQUIRED)
    }
  })

  it('should create', async function () {
    client = createClient({ agent })
    resource = client('todos', { urlRoot: 'todos' })

    render(payload => payload.data.title)

    const title = 'add new item'
    await create({ title })

    const todo = getResource()
    assert.equal(todo.payload.data.title, title)
  })

  it('should not authenticate', async function () {
    client = createClient({ agent })
    resource = client('admin')
    render()

    try {
      await fetch()
      return assertPromiseFailed()
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
    render()

    await fetch()

    const admin = getResource()
    assert.equal(admin.payload.data, AUTHORIZED)
    assert.equal(subject.find('#root').text(), AUTHORIZED)
  })
})

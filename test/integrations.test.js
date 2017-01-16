import assert from 'assert'
import { mount } from 'enzyme'
import supertest from 'supertest'

import createClient from '../lib/createClient'
import withResource from './fixtures/TestComponent'
import withConnectContext from './fixtures/withConnectContext'
import store from './fixtures/store'
import app from './fixtures/app'

describe('TestComponent', () => {
  let agent
  let client
  let resource
  let subject

  function render (props = {}) {
    const TestComponent = withResource(resource)
    subject = mount(withConnectContext(TestComponent, props))
  }

  function assertState (todos) {
    assert.deepEqual(store.getState().resource, {todos})
  }

  beforeEach(() => {
    agent = supertest(app)
    store.dispatch(createClient({ agent })('todos').reset({ body: [] }))
  })

  it('should render', (done) => {
    client = createClient({ agent, events: { response () { done() } } })
    resource = client('todos')
    render()

    assert.equal(subject.find('#root').length, 1)
  })

  it('should update state', (done) => {
    client = createClient({ agent, events: { response () { done() } } })
    resource = client('todos')
    render()

    assertState({ initialized: true, busy: true, payload: undefined, previous: { body: [] } })
  })

  it('should handle request event', (done) => {
    client = createClient({
      agent,
      events: {
        request (req, {method, url}) {
          assert.equal(method, 'get')
          assert.equal(url, '/todos')
        },
        response () { done() }
      }
    })

    resource = client('todos')
    render()
  })

  it('should build url with id', (done) => {
    client = createClient({
      agent,
      events: {
        request (req, {url}) { assert.equal(url, '/todos/1') },
        response () { done() }
      }
    })

    resource = client('todos', { urlRoot: 'todos' })

    render({ id: 1 })
  })

  it('should build url with null id', (done) => {
    client = createClient({
      agent,
      events: {
        request (req, {url}) { assert.equal(url, '/todos') },
        response () { done() }
      }
    })

    resource = client('todos', { urlRoot: 'todos' })

    render({ id: null })
  })

  it('should reset', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    const { reset } = subject.find('TestComponent').props()
    const payload = { body: [{ title: 'reset' }] }

    await reset(payload)

    assertState({ initialized: true, busy: false, payload, previous: null })
  })

  it('should fetch', async function () {
    client = createClient({ agent })
    resource = client('todos')
    render()

    assertState({ initialized: true, busy: true, payload: undefined, previous: { body: [] } })
    const { fetch } = subject.find('TestComponent').props()

    await fetch()

    const { busy, payload, previous } = store.getState().resource.todos
    const expected = [
      { title: 'Get milk' },
      { title: 'Wash cat' },
      { title: 'Eat food' },
      { title: 'Take nap' }
    ]

    assert(!busy)
    assert.deepEqual(payload.body, expected)
    assert.equal(previous, null)

    const propBody = subject.find('TestComponent').prop('resource').payload.body
    assert.deepEqual(propBody, expected)
    assert.equal(subject.find('tr').length, 4)
  })
})

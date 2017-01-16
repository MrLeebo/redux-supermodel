import assert from 'assert'
import createClient from '../lib/createClient'

const client = createClient()
describe('client', () => {
  it('should be function', () => {
    assert.equal(typeof client, 'function')
  })
})

let resource = client('todos', { urlRoot: 'todos' })
describe('resource', () => {
  it('should require resource', () => {
    assert.throws(client, 'name required')
  })

  it('should default the url', () => {
    resource = client('todos')
    assert.equal(resource.url, 'todos')
  })

  it('should have key functions', () => {
    assert.equal(typeof resource, 'function')
    assert.equal(typeof resource.fetch, 'function')
    assert.equal(typeof resource.create, 'function')
    assert.equal(typeof resource.update, 'function')
    assert.equal(typeof resource.destroy, 'function')
  })

  it('should not modify input options', () => {
    const p = {}
    client('todos', p)
    assert.deepEqual(p, {})
  })

  it('should copy custom options to resource', () => {
    const resource = client('todos', { specialProp: true })
    assert(resource.specialProp)
  })

  it('should retrieve state', () => {
    const state = resource({ resource: { todos: { initialized: true, payload: { pass: true } } } })
    assert.deepEqual(state.payload, { pass: true })
  })
})

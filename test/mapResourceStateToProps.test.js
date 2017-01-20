import assert from 'assert'
import withDefinition from '../lib/mapResourceStateToProps'

describe('mapResourceStateToProps', () => {
  let subject = withDefinition('test')

  function run (state) {
    return subject({ resource: { test: state } })
  }

  it('should get prop', () => {
    const result = run({ initialized: true, payload: { pass: true } })
    assert.deepEqual(result, {
      initialized: true,
      payload: { pass: true },
      pendingCreate: false,
      pendingDestroy: false,
      pendingFetch: false,
      pendingUpdate: false,
      ready: true
    })
  })

  it('should set pendingFetch', () => {
    const result = run({ initialized: true, busy: true, meta: { action: 'fetch' } })
    assert(result.pendingFetch)
  })

  it('should set pendingCreate', () => {
    const result = run({ initialized: true, busy: true, meta: { action: 'create' } })
    assert(result.pendingCreate)
  })

  it('should set pendingUpdate', () => {
    const result = run({ initialized: true, busy: true, meta: { action: 'update' } })
    assert(result.pendingUpdate)
  })

  it('should set pendingDestroy', () => {
    const result = run({ initialized: true, busy: true, meta: { action: 'destroy' } })
    assert(result.pendingDestroy)
  })

  it('should set custom prop', () => {
    const result = run({ initialized: true, wingding: true })
    assert(result.wingding)
  })

  it('should set payload to default for no state', () => {
    const defaultPayload = Symbol()
    subject = withDefinition('test', { defaultPayload })
    const result = run()
    assert.equal(result.payload, defaultPayload)
  })

  it('should set payload to default for partial state', () => {
    const defaultPayload = Symbol()
    subject = withDefinition('test', { defaultPayload })
    const result = run({ initialized: true, payload: null })
    assert.equal(result.payload, defaultPayload)
  })

  it('should support mountedAt option', () => {
    const result = subject({ fizzbuzz: { test: { initialized: true } } }, { mountedAt: 'fizzbuzz' })
    assert(result.initialized)
  })
})

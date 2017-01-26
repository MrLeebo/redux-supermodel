/* global $subject, $result */
import assert from 'assert'
import withDefinition from '../lib/mapResourceStateToProps'

describe('mapResourceStateToProps', () => {
  subject(() => withDefinition('test'))
  def('result', () => state => $subject({ resource: { test: state } }))

  it('should get prop', () => {
    const state = { initialized: true, payload: { pass: true } }
    const result = $result(state)
    assert.equal(result.initialized, true)
    assert.deepEqual(result.payload, { pass: true })
    assert.equal(result.pendingCreate, false)
    assert.equal(result.pendingDestroy, false)
    assert.equal(result.pendingFetch, false)
    assert.equal(result.pendingUpdate, false)
    assert.equal(result.ready, true)
  })

  it('should set pendingFetch', () => {
    const state = { initialized: true, busy: true, meta: { action: 'fetch' } }
    assert($result(state).pendingFetch)
  })

  it('should set pendingCreate', () => {
    const state = { initialized: true, busy: true, meta: { action: 'create' } }
    assert($result(state).pendingCreate)
  })

  it('should set pendingUpdate', () => {
    const state = { initialized: true, busy: true, meta: { action: 'update' } }
    assert($result(state).pendingUpdate)
  })

  it('should set pendingDestroy', () => {
    const state = { initialized: true, busy: true, meta: { action: 'destroy' } }
    assert($result(state).pendingDestroy)
  })

  it('should set custom prop', () => {
    const state = { initialized: true, wingding: true }
    assert($result(state).wingding)
  })

  describe('with default payload', () => {
    const defaultPayload = Symbol()
    subject(() => withDefinition('test', { defaultPayload }))

    it('should set payload to default for no state', () => {
      assert.equal($result().payload, defaultPayload)
    })

    it('should set payload to default for partial state', () => {
      const state = { initialized: true, payload: null }
      assert.equal($result(state).payload, defaultPayload)
    })
  })

  describe('with state mounted to "fizzbuss"', () => {
    def('result', () => $subject({ fizzbuzz: { test: { initialized: true } } }, { mountedAt: 'fizzbuzz' }))

    it('should support mountedAt option', () => {
      assert($result.initialized)
    })
  })
})

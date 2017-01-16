import assert from 'assert'
import reducer from '../lib/reducer'

describe('reducer', () => {
  let subject
  let state
  let action

  function run () {
    subject = reducer(state, action)
  }

  before(() => {
    state = action = undefined
  })

  describe('reset', () => {
    it('should initialize resource', () => {
      action = { type: '@@redux-supermodel/RESET', meta: { resourceName: 'blogs' } }
      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: undefined,
        previous: null
      } })
    })

    it('should set resource to given value', () => {
      action = {
        type: '@@redux-supermodel/RESET',
        payload: { a: 1 },
        meta: { resourceName: 'blogs' }
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: { a: 1 },
        previous: null
      } })
    })
  })

  describe('request pending', () => {
    it('should set state', () => {
      state = { blogs: {} }
      action = {
        type: '@@redux-supermodel/REQUEST_PENDING',
        payload: { id: 123 },
        meta: { resourceName: 'blogs' }
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: true,
        payload: { id: 123 },
        previous: undefined
      } })
    })
  })

  describe('request fulfilled', () => {
    it('should set state', () => {
      state = { blogs: { busy: true, payload: { id: 123 } } }
      action = { type: '@@redux-supermodel/REQUEST_FULFILLED', payload: { id: 123, owner: 'Steve' }, meta: { resourceName: 'blogs' } }
      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: { id: 123, owner: 'Steve' },
        previous: null
      } })
    })
  })

  describe('request rejected', () => {
    it('should set state', () => {
      state = { blogs: { busy: true, payload: { id: 123 } } }
      action = { type: '@@redux-supermodel/REQUEST_REJECTED', payload: 'something broke', error: true, meta: { resourceName: 'blogs' } }
      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: undefined,
        previous: null,
        error: 'something broke'
      } })
    })
  })

  describe('invalid action', () => {
    it('should throw', () => {
      const type = '@@redux-supermodel/INVALID'
      action = { type }

      assert.throws(run, `Invalid ${type}: Missing "meta.resourceName" property`)
    })
  })

  describe('unknown action', () => {
    it('should throw', () => {
      const type = '@@redux-supermodel/UNKNOWN'
      action = { type, meta: { resourceName: 'blogs' } }
      assert.throws(run, `Unrecognized action type: ${type}`)
    })
  })

  describe('other action', () => {
    it('should ignore', () => {
      action = { type: '???' }
      run()

      assert.deepEqual(subject, state)
    })
  })
})

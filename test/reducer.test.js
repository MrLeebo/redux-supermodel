import assert from 'assert'
import reducer from '../lib/reducer'
import * as types from '../lib/actionTypes'

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
    it('should destroy resource', () => {
      action = { type: types.RESET, meta: { resourceName: 'blogs' } }
      run()

      assert.deepEqual(subject, {})
    })

    it('should set resource to given value', () => {
      const meta = { resourceName: 'blogs' }
      action = {
        type: types.RESET,
        payload: { a: 1 },
        meta
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: { a: 1 },
        previous: null,
        meta
      } })
    })

    it('should accept null as value', () => {
      const meta = { resourceName: 'blogs' }
      action = {
        type: types.RESET,
        payload: null,
        meta
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: null,
        previous: null,
        meta
      } })
    })
  })

  describe('request pending', () => {
    it('should ignore payload', () => {
      state = { blogs: {} }
      const meta = { resourceName: 'blogs', definition: { url: 'blogs' } }
      action = {
        type: types.PENDING,
        payload: { id: 123 },
        meta
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: true,
        payload: undefined,
        previous: undefined,
        meta
      } })
    })

    it('should set payload with identity transform', () => {
      state = { blogs: {} }
      const meta = { resourceName: 'blogs', definition: { url: 'blogs', transform: x => x } }
      action = {
        type: types.PENDING,
        payload: { id: 123 },
        meta
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: true,
        payload: { id: 123 },
        previous: undefined,
        meta
      } })
    })
  })

  describe('request fulfilled', () => {
    it('should set state', () => {
      state = { blogs: { busy: true, payload: { id: 123 } } }
      const meta = { resourceName: 'blogs', definition: { url: 'blogs' } }
      action = {
        type: types.FULFILLED,
        payload: { id: 123, owner: 'Steve' },
        meta
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: { id: 123, owner: 'Steve' },
        previous: null,
        meta
      } })
    })
  })

  describe('request rejected', () => {
    it('should set state', () => {
      state = { blogs: { busy: true, payload: { id: 123 } } }
      const meta = { resourceName: 'blogs', definition: { url: 'blogs' } }
      action = {
        type: types.REJECTED,
        payload: 'something broke',
        error: true,
        meta
      }

      run()

      assert.deepEqual(subject, { blogs: {
        initialized: true,
        busy: false,
        payload: { id: 123 },
        previous: null,
        error: 'something broke',
        meta
      } })
    })
  })

  describe('invalid action', () => {
    it('should throw', () => {
      const type = `${types.PREFIX}INVALID`
      action = { type }

      assert.throws(run, `Invalid ${type}: Missing "meta.resourceName" property`)
    })
  })

  describe('unknown action', () => {
    it('should throw', () => {
      const type = `${types.PREFIX}UNKNOWN`
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

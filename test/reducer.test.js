/* global $subject, $state */
import assert from 'assert'
import reducer from '../lib/reducer'
import * as types from '../lib/actionTypes'

describe('reducer', () => {
  subject(() => action => reducer($state, action))
  def('state', () => ({}))

  describe('reset', () => {
    it('should destroy resource', () => {
      const action = { type: types.RESET, meta: { resourceName: 'blogs' } }
      assert.deepEqual($subject(action), {})
    })

    it('should set resource to given value', () => {
      const meta = { resourceName: 'blogs' }
      const action = {
        type: types.RESET,
        payload: { a: 1 },
        meta
      }

      const expected = {
        blogs: {
          initialized: true,
          busy: false,
          payload: { a: 1 },
          previous: null,
          meta
        }
      }

      assert.deepEqual($subject(action), expected)
    })

    it('should accept null as value', () => {
      const meta = { resourceName: 'blogs' }
      const action = {
        type: types.RESET,
        payload: null,
        meta
      }

      const expected = {
        blogs: {
          initialized: true,
          busy: false,
          payload: null,
          previous: null,
          meta
        }
      }

      assert.deepEqual($subject(action), expected)
    })
  })

  describe('with empty state', () => {
    def('state', () => ({ blogs: {} }))

    it('should ignore payload on pending', () => {
      const meta = { resourceName: 'blogs', definition: { url: 'blogs' } }
      const action = {
        type: types.PENDING,
        payload: { id: 123 },
        meta
      }

      const expected = {
        blogs: {
          initialized: true,
          busy: true,
          payload: undefined,
          previous: undefined,
          meta
        }
      }

      assert.deepEqual($subject(action), expected)
    })

    it('should set payload with identity transform on pending', () => {
      const meta = { resourceName: 'blogs', definition: { url: 'blogs', transform: x => x } }
      const action = {
        type: types.PENDING,
        payload: { id: 123 },
        meta
      }

      const expected = {
        blogs: {
          initialized: true,
          busy: true,
          payload: { id: 123 },
          previous: undefined,
          meta
        }
      }

      assert.deepEqual($subject(action), expected)
    })

    it('should not have root param in transform arg', () => {
      const expectedPayload = { id: 123 }
      function transform (payload) {
        assert.deepEqual(payload, expectedPayload)
        return payload
      }

      const meta = { resourceName: 'blogs', definition: { url: 'blogs', rootParam: true, transform } }
      const action = {
        type: types.PENDING,
        payload: expectedPayload,
        meta
      }

      const expected = {
        blogs: {
          initialized: true,
          busy: true,
          payload: expectedPayload,
          previous: undefined,
          meta
        }
      }

      assert.deepEqual($subject(action), expected)
    })
  })

  describe('with pending state', () => {
    def('state', () => ({ blogs: { busy: true, payload: { id: 123 } } }))

    it('should set fulfilled', () => {
      const meta = { resourceName: 'blogs', definition: { url: 'blogs' } }
      const action = {
        type: types.FULFILLED,
        payload: { id: 123, owner: 'Steve' },
        meta
      }

      const expected = {
        blogs: {
          initialized: true,
          busy: false,
          payload: { id: 123, owner: 'Steve' },
          previous: null,
          meta
        }
      }

      assert.deepEqual($subject(action), expected)
    })

    it('should set rejected', () => {
      const meta = { resourceName: 'blogs', definition: { url: 'blogs' } }
      const action = {
        type: types.REJECTED,
        payload: 'something broke',
        error: true,
        meta
      }

      const expected = { blogs: {
        initialized: true,
        busy: false,
        payload: { id: 123 },
        previous: null,
        error: 'something broke',
        meta
      }
      }

      assert.deepEqual($subject(action), expected)
    })
  })

  it('should throw for invalid action', () => {
    const type = `${types.PREFIX}INVALID`
    const action = { type }
    assert.throws(() => $subject(action), `Invalid ${type}: Missing "meta.resourceName" property`)
  })

  it('should throw for unknown action', () => {
    const type = `${types.PREFIX}UNKNOWN`
    const action = { type, meta: { resourceName: 'blogs' } }
    assert.throws(() => $subject(action), `Unrecognized action type: ${type}`)
  })

  it('should ignore other action', () => {
    const action = { type: '???' }
    assert.deepEqual($subject(action), $state)
  })
})

/* global $subject, $payload, $previous, $isFulfilled, $meta */
import assert from 'assert'
import collectionTransform from '../lib/collectionTransform'

describe('collectionTransform', () => {
  subject(() => collectionTransform($payload, $previous, $isFulfilled, $meta))

  def('payload', () => ({}))
  def('previous', () => ({}))
  def('isFulfilled', () => false)
  def('meta', () => ({}))

  it('should ignore unknown actions', () => {
    assert.equal(collectionTransform(), null)
  })

  describe('with create action', () => {
    def('payload', () => ({ data: { id: 2 } }))
    def('previous', () => ({ data: [{ id: 1 }] }))
    def('meta', () => ({ action: 'create' }))

    it('should return previous', () => {
      assert.deepEqual($subject, $previous)
    })

    describe('fulfilled', () => {
      def('isFulfilled', () => true)

      it('should create new item', () => {
        assert.deepEqual($subject, { data: [{ id: 1 }, { id: 2 }] })
      })
    })
  })

  describe('with update action', () => {
    def('payload', () => ({ data: { id: 1, updated: true } }))
    def('meta', () => ({ action: 'update', inputData: { id: 1 } }))
    def('previous', () => ({ data: [{ id: 1 }, { id: 2 }] }))

    it('should return previous', () => {
      assert.equal($subject, $previous)
    })

    describe('fulfilled', () => {
      def('isFulfilled', () => true)

      it('should refresh data', () => {
        assert.deepEqual($subject, { data: [{ id: 1, updated: true }, { id: 2 }] })
      })

      describe('without input data', () => {
        def('meta', () => ({ action: 'update' }))

        it('should return previous', () => {
          assert.equal($subject, $previous)
        })
      })
    })
  })

  describe('with destroy action', () => {
    def('previous', () => ({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] }))

    describe('without input data', () => {
      def('meta', () => ({ action: 'destroy' }))

      it('should return previous data', () => {
        assert.equal($subject, $previous)
      })
    })

    describe('with input data', () => {
      def('meta', () => ({ action: 'destroy', inputData: { id: 1 } }))

      it('should set pending delete', () => {
        assert.deepEqual($subject, { data: [{ id: 1, pendingDelete: true }, { id: 2 }, { id: 3 }] })
      })

      describe('fulfilled', () => {
        def('isFulfilled', () => true)

        it('should remove item', () => {
          assert.deepEqual($subject, { data: [{ id: 2 }, { id: 3 }] })
        })
      })
    })
  })
})

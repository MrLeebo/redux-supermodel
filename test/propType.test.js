/* global $subject, $props */
import assert from 'assert'
import propType from '../lib/propType'
import withDefinition from '../lib/mapResourceStateToProps'

describe('propType', () => {
  subject(() => propType($props, 'resource', 'ANONYMOUS'))
  def('props', () => ({}))

  function assertValidProp () {
    assert.equal($subject, null)
  }

  function assertInvalidProp () {
    assert($subject instanceof Error)
    assert.equal($subject.message, 'Invalid prop `resource` supplied to `ANONYMOUS`, expected a `redux-supermodel` resource.')
  }

  function assertMissingProp () {
    assert($subject instanceof Error)
    assert.equal($subject.message, 'Required prop `resource` was not specified in `ANONYMOUS`.')
  }

  it('should allow missing', assertValidProp)

  describe('with resource', () => {
    def('props', () => ({ resource: withDefinition('foo')({}) }))

    it('should be valid', assertValidProp)
  })

  describe('with non-resource', () => {
    def('props', () => ({ resource: false }))

    it('should be invalid', assertInvalidProp)
  })

  describe('with non-resource that looks like a resource', () => {
    def('props', () => (
      { resource: {
        initialized: true,
        busy: false,
        ready: true,
        payload: { data: [] },
        previous: null
      } }
    ))

    it('should be invalid', assertInvalidProp)
  })

  describe('with required', () => {
    subject(() => propType.isRequired($props, 'resource', 'ANONYMOUS'))

    it('should return error', assertMissingProp)

    describe('with non-resource', () => {
      def('props', () => ({ resource: false }))

      it('should be invalid', assertInvalidProp)
    })
  })
})

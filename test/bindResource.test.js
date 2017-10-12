/* global $subject, $agent, $options, $client, $resource, $onMountError, $mapProps, $mount, $willReceiveProps, $onWillReceivePropsError, $unmount, $onUnmountError, $a, $b */
/* eslint-env mocha */
import React from 'react'
import assert from 'assert'
import mock from 'mock-require'
import { spy, stub } from 'sinon'
import { mount } from 'enzyme'

import app from './fixtures/app'
import request from './fixtures/axiosTest'
import store from './fixtures/store'

import bindResource, { getDisplayName } from '../lib/bindResource'
import createClient from '../lib/createClient'

const MyComponent = () => <div />

describe('bindResource', () => {
  subject(() => (resources, options = $options) => {
    const Component = bindResource(resources, options)(MyComponent)
    return mount(
      <Component
        store={store}
        onMountError={$onMountError}
        onWillReceivePropsError={$onWillReceivePropsError}
        onUnmountError={$onUnmountError}
      />
    )
  })

  def('options', () => ({}))
  def('agent', () => request(app))
  def('client', () => createClient({ agent: $agent }))
  def('resource', () => $client('blogs'))
  def('mount', spy)
  def('unmount', spy)
  def('onMountError', spy)
  def('onWillReceivePropsError', spy)
  def('onUnmountError', spy)
  def('mapProps', () => stub().returns({}))

  describe('mounted component', () => {
    subject(() => $subject({ resource: $resource }))

    it('should fetch on mount', () => {
      const fetch = spy($resource, 'fetch')

      assert($subject)
      assert(fetch.calledOnce)
    })

    it('should reset on unmount', () => {
      const reset = spy($resource, 'reset')
      $subject.unmount()

      assert(reset.calledOnce)
    })

    describe('with mount function', () => {
      def('options', () => ({ mount: $mount }))

      it('should fetch on mount', () => {
        const fetch = spy($resource, 'fetch')

        assert($subject)
        assert($mount.calledOnce)
        assert(fetch.notCalled)
      })

      describe('with mount rejected promise', () => {
        def('mount', () => () => Promise.reject(new Error('rejected')))

        it('should catch on mount', () => {
          assert($subject)
          return $mount().then(
            () => assert.fail(null, null, 'Expected rejected promise'),
            () => assert($onMountError.calledOnce)
          )
        })
      })
    })

    describe('with mapProps function', () => {
      def('options', () => ({ mapProps: $mapProps }))

      it('should override default mapStateToProps', async () => {
        assert($subject)
        assert($mapProps.called)
      })
    })

    describe('with willReceiveProps function', () => {
      def('options', () => ({ willReceiveProps: $willReceiveProps }))

      describe('with willReceiveProps rejected promise', () => {
        def('willReceiveProps', () => () => Promise.reject(new Error('rejected')))

        it('should catch on willReceiveProps', () => {
          assert($subject.setProps($subject.props()))
          return $willReceiveProps().then(
            () => assert.fail(null, null, 'Expected rejected promise'),
            () => assert($onWillReceivePropsError.calledOnce)
          )
        })
      })
    })

    describe('with unmount function', () => {
      def('options', () => ({ unmount: $unmount }))

      describe('with unmount rejected promise', () => {
        def('unmount', () => () => Promise.reject(new Error('rejected')))

        it('should catch on unmount', () => {
          assert($subject.unmount())
          return $unmount().then(
            () => assert.fail(null, null, 'Expected rejected promise'),
            () => assert($onUnmountError.calledOnce)
          )
        })
      })
    })

    describe('with connect options', () => {
      def('options', () => ({ connectOptions: { withRef: true } }))

      it('should ref', () => {
        assert($subject.instance().getWrappedInstance())
      })
    })

    describe('with merge props', () => {
      def('options', () => ({ mount () {}, mergeProps () { return { merged: true, fetchAll () {}, resetAll () {} } } }))

      it('should invoke function', () => {
        assert($subject.find('MyComponent').prop('merged'))
      })
    })
  })

  describe('multiple mounted resources', () => {
    subject(() => $subject({ a: $a, b: $b }))
    def('a', () => $client('a'))
    def('b', () => $client('b'))

    it('should fetch on mount', () => {
      const fetchA = spy($a, 'fetch')
      const fetchB = spy($b, 'fetch')

      assert($subject)
      assert(fetchA.calledOnce)
      assert(fetchB.calledOnce)
    })

    it('should reset on unmount', () => {
      const resetA = spy($a, 'reset')
      const resetB = spy($b, 'reset')

      $subject.unmount()
      assert(resetA.calledOnce)
      assert(resetB.calledOnce)
    })
  })

  describe('without redux', () => {
    before(() => {
      mock('redux')
    })

    it('should require redux', () => {
      assert.throws(bindResource, 'You must install redux before you can call bindResource.')
    })

    after(() => {
      mock.stop('redux')
    })
  })

  describe('without react-redux', () => {
    before(() => {
      mock('react-redux')
    })

    it('should require react-redux', () => {
      assert.throws(bindResource, 'You must install react-redux before you can call bindResource.')
    })

    after(() => {
      mock.stop('react-redux')
    })
  })

  describe('displayName', () => {
    it('should display default name', () => {
      assert.equal(getDisplayName(), 'ResourceBound(Anonymous)')
    })

    it('should display function name', () => {
      function FunctionalComponent () { return null }

      assert.equal(getDisplayName(FunctionalComponent), 'ResourceBound(FunctionalComponent)')
    })

    it('should display class name', () => {
      class ClassComponent extends React.Component {
        render () { return null }
      }

      assert.equal(getDisplayName(ClassComponent), 'ResourceBound(ClassComponent)')
    })

    it('should display override name', () => {
      function ActualComponent () { return null }
      ActualComponent.displayName = 'OverrideComponent'

      assert.equal(getDisplayName(ActualComponent), 'ResourceBound(OverrideComponent)')
    })
  })
})

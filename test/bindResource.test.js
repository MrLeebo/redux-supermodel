/* global $subject, $agent, $options, $client, $resource, $mount, $a, $b */
/* eslint-env mocha */
import React from 'react'
import assert from 'assert'
import mock from 'mock-require'
import { spy } from 'sinon'
import { mount } from 'enzyme'

import app from './fixtures/app'
import request from './fixtures/axiosTest'
import store from './fixtures/store'

import bindResource from '../lib/bindResource'
import createClient from '../lib/createClient'

function MyComponent (props) {
  return <div />
}

describe('bindResource', () => {
  subject(() => (resources, options = $options) => {
    const Component = bindResource(resources, options)(MyComponent)
    return mount(<Component store={store} />)
  })

  def('options', () => ({}))
  def('agent', () => request(app))
  def('client', () => createClient({ agent: $agent }))
  def('resource', () => $client('blogs'))

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
      def('mount', spy)
      def('options', () => ({ mount: $mount }))

      it('should fetch on mount', () => {
        const fetch = spy($resource, 'fetch')

        assert($subject)
        assert($mount.calledOnce)
        assert(fetch.notCalled)
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
})

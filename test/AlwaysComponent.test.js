/* global $subject, $agent, $component, $resource, $client, $fetch */
import assert from 'assert'
import { mount } from 'enzyme'

import request from './fixtures/axiosTest'
import alwaysComponent from './fixtures/AlwaysRendersComponent'
import withConnectContext from './fixtures/withConnectContext'
import store from './fixtures/store'

import app, {
  FORTUNE
} from './fixtures/app'

import createClient from '../lib/createClient'
import { nuke } from '../lib/actionCreators'

describe('AlwaysComponent', () => {
  subject(() => mount(withConnectContext($component)).find('AlwaysRendersComponent'))
  def('component', () => alwaysComponent($resource))
  def('client', () => createClient({ agent: $agent }))
  def('agent', () => request(app))
  def('fetch', () => $subject.prop('fetch'))

  beforeEach(() => {
    store.dispatch(nuke())
  })

  describe('with default payload', () => {
    const NOT_FETCHED = 'not fetched'
    def('resource', () => $client('fortunecookie', { defaultPayload: { data: NOT_FETCHED } }))

    it('should use default value before fetch', async function () {
      // Before fetching, the default payload should be part of the state
      assert.equal($subject.find('#root').text(), NOT_FETCHED)

      await $fetch()

      // After fetching, it should change to the fetched data
      assert.equal($subject.find('#root').text(), FORTUNE)
    })
  })
})

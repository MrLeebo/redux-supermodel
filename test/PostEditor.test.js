/* global $subject, $agent, $component, $resource, $client */
import React from 'react'
import assert from 'assert'
import { mount } from 'enzyme'
import { spy } from 'sinon'

import request from './fixtures/axiosTest'
import postEditor from './fixtures/PostEditor'
import store from './fixtures/store'

import app, { POST } from './fixtures/app'

import createClient from '../lib/createClient'
import { nuke } from '../lib/actionCreators'

describe('PostEditor', () => {
  subject(() => mount(<$component store={store} id={1} />))
  def('component', () => postEditor($resource))
  def('client', () => createClient({ agent: $agent }))
  def('agent', () => request(app))
  def('resource', () => $client('post', { urlRoot: 'posts' }))

  beforeEach(() => {
    store.dispatch(nuke())
  })

  function assertForm (name) {
    const result = $subject.find({ name }).get(0).value
    assert.equal(result, POST[name], `Expect Form[${name}] value to be "${POST[name]}" but it was "${result}"`)
  }

  function setFormValue (name, value) {
    $subject.find({ name }).node.value = value
  }

  function submitForm () {
    $subject.find('form').simulate('submit')
  }

  it('should fetch on mount', () => {
    const fetch = spy($resource, 'fetch')

    assert($subject)
    assert(fetch.calledOnce)
  })

  it('should populate form', async function () {
    await $subject.find('PostEditor').prop('fetchPost')({ id: 1 })

    assertForm('id')
    assertForm('title')
    assertForm('body')
  })

  it('should update on submit', async function () {
    const title = 'A new post'
    const body = 'Cool, huh?'
    const update = spy($resource, 'update')

    await $subject.find('PostEditor').prop('fetchPost')({ id: 1 })

    setFormValue('title', title)
    setFormValue('body', body)
    submitForm()

    assert(update.withArgs({ id: '1', title, body }).calledOnce)
  })
})

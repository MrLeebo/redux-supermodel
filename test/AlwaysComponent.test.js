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
  let subject
  let agent
  let client
  let resource

  function render (props = {}) {
    const AlwaysRendersComponent = alwaysComponent(resource)
    subject = mount(withConnectContext(AlwaysRendersComponent, props)).find('AlwaysRendersComponent')
  }

  function fetch (data) {
    return subject.prop('fetch')(data)
  }

  function createAgent () {
    agent = request(app)
  }

  function nukeStore () {
    store.dispatch(nuke())
  }

  beforeEach(() => {
    createAgent()
    nukeStore()
  })

  it('should use default value before fetch', async function () {
    const data = 'not fetched'
    client = createClient({ agent })
    resource = client('fortunecookie', { defaultPayload: { data } })

    render()

    // Before fetching, the default payload should be part of the state
    assert.equal(subject.find('#root').text(), data)

    await fetch()

    // After fetching, it should change to the fetched data
    assert.equal(subject.find('#root').text(), FORTUNE)
  })
})

import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import propType from '../../lib/propType'

export default function withResource (resource, map = (payload) => payload.data) {
  function SimpleComponent ({ resource }) {
    const { ready, payload, error } = resource

    if (!ready) return <div>Please wait...</div>
    if (error) return <div className='error'>{error.response.data}</div>
    return <div id='root'>{map(payload)}</div>
  }

  SimpleComponent.propTypes = {
    resource: propType
  }

  function mapStateToProps (state) {
    return { resource: resource(state) }
  }

  function mapDispatchToProps (dispatch) {
    return bindActionCreators({
      fetch: resource.fetch,
      create: resource.create,
      update: resource.update
    }, dispatch)
  }

  return connect(mapStateToProps, mapDispatchToProps)(SimpleComponent)
}

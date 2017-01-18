import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

export default function withResource (resource) {
  function AlwaysRendersComponent ({ resource }) {
    const { ready, payload, error } = resource

    return (
      <div>
        {!ready && <span id='loading'>Please wait...</span>}
        {error && <span className='error'>{error.response.data}</span>}
        <div id='root'>{payload.data || 'Unknown'}</div>
      </div>
    )
  }

  function mapStateToProps (state) {
    return { resource: resource(state) }
  }

  function mapDispatchToProps (dispatch) {
    return bindActionCreators({
      fetch: resource.fetch
    }, dispatch)
  }

  return connect(mapStateToProps, mapDispatchToProps)(AlwaysRendersComponent)
}

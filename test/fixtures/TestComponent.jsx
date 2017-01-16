import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import TestTable from './TestTable'

export default function withResource (resource) {
  class TestComponent extends React.Component {
    constructor () {
      super()
      this.handleFetch = this.handleFetch.bind(this)
      this.handleReset = this.handleReset.bind(this)
    }

    componentDidMount () {
      this.handleFetch()
    }

    handleFetch () {
      this.props.fetch({ id: this.props.id })
    }

    handleReset () {
      this.props.reset({ reset: true })
    }

    render () {
      const { resource } = this.props
      return (
        <div id='root'>
          <div>
            <button id='refresh' disabled={!resource.ready} onClick={this.handleFetch}>Refresh</button>
            <button id='reset' disabled={!resource.ready} onClick={this.handleReset}>Reset</button>
          </div>
          <TestTable resource={resource} />
        </div>
      )
    }
  }

  function mapStateToProps (state) {
    return { resource: resource(state) }
  }

  function mapDispatchToProps (dispatch) {
    return bindActionCreators({
      fetch: resource.fetch,
      create: resource.create,
      reset: resource.reset
    }, dispatch)
  }

  return connect(mapStateToProps, mapDispatchToProps)(TestComponent)
}

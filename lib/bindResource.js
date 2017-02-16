import React from 'react'

export default function bindResource (resources, options = {}) {
  const redux = require('redux')
  if (!redux) {
    throw new Error('You must install redux before you can call bindResource.')
  }

  const reactRedux = require('react-redux')
  if (!reactRedux) {
    throw new Error('You must install react-redux before you can call bindResource.')
  }

  const { mount } = options

  return function bindResourceWrapper (WrappedComponent) {
    class ResourceBound extends React.Component {
      constructor () {
        super()
        this.refWrapped = this.refWrapped.bind(this)
      }

      componentDidMount () {
        if (mount) {
          return mount(this.props)
        } else if (mount !== false) {
          return this.props.fetchAll()
        }
      }

      componentWillUnmount () {
        this.props.resetAll()
      }

      refWrapped (ref) {
        this.wrapped = ref
      }

      render () {
        return <WrappedComponent ref={this.refWrapped} {...this.props} />
      }
    }

    ResourceBound.propTypes = {
      fetchAll: React.PropTypes.func.isRequired,
      resetAll: React.PropTypes.func.isRequired
    }

    ResourceBound.displayName = `ResourceBound(${WrappedComponent.displayName || WrappedComponent.name || 'Anonymous'})`

    const keys = Object.keys(resources)
    function mapStateToProps (state) {
      return keys.reduce((accum, key) => {
        accum[key] = resources[key](state)
        return accum
      }, {})
    }

    function mapDispatchToProps (dispatch, ownProps) {
      const actions = ['fetch', 'create', 'update', 'destroy', 'reset']
      const actionName = (action, [first, ...rest]) => `${action}${first.toUpperCase()}${rest.join('')}`

      const actionCreators = redux.bindActionCreators(keys.reduce((accum, key) => {
        actions.forEach(action => { accum[actionName(action, key)] = resources[key][action] })
        return accum
      }, {}), dispatch)

      return {
        ...actionCreators,
        fetchAll () {
          keys.forEach(key => dispatch(resources[key].fetch(ownProps)))
        },
        resetAll () {
          keys.forEach(key => dispatch(resources[key].reset()))
        }
      }
    }

    return reactRedux.connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(ResourceBound)
  }
}

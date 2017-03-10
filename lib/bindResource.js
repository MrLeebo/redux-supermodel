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
          const result = mount(this.props)
          if (result && typeof result.catch === 'function') {
            return result.catch(this.props.onMountError)
          } else {
            return result
          }
        } else if (mount !== false) {
          return this.props.fetchAll().catch(this.props.onMountError)
        }
      }

      componentWillUnmount () {
        this.props.resetAll().catch(this.props.onUnmountError)
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
      resetAll: React.PropTypes.func.isRequired,
      onMountError: React.PropTypes.func,
      onUnmountError: React.PropTypes.func
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
          return Promise.all(keys.map(key => dispatch(resources[key].fetch(ownProps))))
        },
        resetAll () {
          return Promise.all(keys.map(key => dispatch(resources[key].reset())))
        }
      }
    }

    return reactRedux.connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(ResourceBound)
  }
}

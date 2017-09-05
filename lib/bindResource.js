import React from 'react'
import PropTypes from 'prop-types'

export const getDisplayName = (Component = {}) => `ResourceBound(${Component.displayName || Component.name || 'Anonymous'})`

export default function bindResource (resources, options = {}) {
  const redux = require('redux')
  if (!redux) {
    throw new Error('You must install redux before you can call bindResource.')
  }

  const reactRedux = require('react-redux')
  if (!reactRedux) {
    throw new Error('You must install react-redux before you can call bindResource.')
  }

  const {
    mount = props => props.fetchAll(),
    unmount = props => props.resetAll(),
    willReceiveProps = undefined,
    mapProps = undefined,
    mergeProps = undefined,
    connectOptions = undefined
  } = options

  return function bindResourceWrapper (WrappedComponent) {
    class ResourceBound extends React.Component {
      async componentDidMount () {
        if (mount) {
          try {
            await mount(this.props)
          } catch (err) {
            this.props.onMountError(err)
          }
        }
      }

      async componentWillReceiveProps (nextProps) {
        if (willReceiveProps) {
          try {
            await willReceiveProps(this.props, nextProps)
          } catch (err) {
            this.props.onWillReceivePropsError(err)
          }
        }
      }

      async componentWillUnmount () {
        if (unmount) {
          try {
            await unmount(this.props)
          } catch (err) {
            this.props.onUnmountError(err)
          }
        }
      }

      render () {
        return <WrappedComponent {...this.props} />
      }
    }

    ResourceBound.propTypes = {
      fetchAll: PropTypes.func.isRequired,
      resetAll: PropTypes.func.isRequired,
      onMountError: PropTypes.func,
      onWillReceivePropsError: PropTypes.func,
      onUnmountError: PropTypes.func
    }

    ResourceBound.defaultProps = {
      onMountError: console.error,
      onWillReceivePropsError: console.error,
      onUnmountError: console.error
    }

    ResourceBound.displayName = getDisplayName(WrappedComponent)

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
          return Promise.all(keys.map(key => dispatch(resources[key].fetch())))
        },
        resetAll () {
          return Promise.all(keys.map(key => dispatch(resources[key].reset())))
        }
      }
    }

    return reactRedux.connect(mapProps || mapStateToProps, mapDispatchToProps, mergeProps, connectOptions)(ResourceBound)
  }
}

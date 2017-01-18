import { resourceActionCreators } from './actionCreators'

export default function createClient (baseUrl, clientOptions = {}) {
  if (arguments.length === 1 && typeof baseUrl === 'object') {
    // Calling createClient({ ... }) is equivalent to createClient('/', {...})
    clientOptions = baseUrl
    baseUrl = '/'
  }

  return function createResource (name, definitionOptions = {}) {
    let options = definitionOptions

    if (!name) {
      throw new Error('name required')
    }

    if (!options || (!options.url && !options.urlRoot)) {
      options = { ...options, url: name }
    }

    function getDefaultProps () {
      return {
        busy: false,
        ready: false,
        payload: options.defaultPayload,
        previous: undefined
      }
    }

    function mapResourceStateToProps (state, mapOptions = {}) {
      const mountedAt = mapOptions.mountedAt || 'resource'
      const resource = state[mountedAt] && state[mountedAt][name]
      return resource && resource.initialized && {
        ...resource,
        payload: resource.payload || options.defaultPayload,
        ready: !resource.busy
      } || getDefaultProps()
    }

    const actionCreators = resourceActionCreators(baseUrl, name, options, clientOptions)
    return Object.assign(mapResourceStateToProps, options, actionCreators)
  }
}

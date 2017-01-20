import { resourceActionCreators } from './actionCreators'
import withDefinition from './mapResourceStateToProps'

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

    const actionCreators = resourceActionCreators(baseUrl, name, options, clientOptions)
    return Object.assign(withDefinition(name, options), options, actionCreators)
  }
}

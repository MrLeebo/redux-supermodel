import { resourceActionCreators } from './actionCreators'
import withDefinition from './mapResourceStateToProps'
import collectionTransform from './collectionTransform'

export default function createClient (baseUrl, clientOptions) {
  if (arguments.length === 1 && typeof baseUrl === 'object') {
    // Calling createClient({ ... }) is equivalent to createClient('/', {...})
    clientOptions = baseUrl
    baseUrl = '/'
  }

  function createResource (name, definitionOptions = {}) {
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

  createResource.baseUrl = baseUrl
  createResource.createCollection = (nm, dopts = {}) => {
    const transform = dopts.transform ? [collectionTransform, dopts.transform] : collectionTransform
    return createResource(nm, { ...dopts, transform })
  }

  return createResource
}

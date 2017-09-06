// Generates a function when given a resource definition that will transform the resource's state in redux into a prop for the component

export const _metaTag = Symbol('redux.supermodel.resource')

export default function withDefinition (name, definition = {}) {
  const { defaultPayload = {} } = definition

  return function mapResourceStateToProps (state, mapOptions = {}) {
    const mountedAt = mapOptions.mountedAt || 'resource'
    const resource = state[mountedAt] && state[mountedAt][name]

    if (!resource || (!resource.initialized && !resource.busy && !resource.error)) {
      return { payload: defaultPayload, [_metaTag]: true }
    }

    const pendingAction = resource.busy && resource.meta && resource.meta.action
    return {
      ...resource,
      payload: resource.payload || defaultPayload,
      ready: !resource.busy,
      pendingFetch: pendingAction === 'fetch',
      pendingCreate: pendingAction === 'create',
      pendingUpdate: pendingAction === 'update',
      pendingDestroy: pendingAction === 'destroy',
      [_metaTag]: true
    }
  }
}

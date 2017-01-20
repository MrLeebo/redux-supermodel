// Generates a function when given a resource definition that will transform the resource's state in redux into a prop for the component

export default function withDefinition (name, definition = {}) {
  const { defaultPayload } = definition

  return function mapResourceStateToProps (state, mapOptions = {}) {
    const mountedAt = mapOptions.mountedAt || 'resource'
    const resource = state[mountedAt] && state[mountedAt][name]

    if (!resource || !resource.initialized) {
      return { payload: defaultPayload }
    }

    const pendingAction = resource.busy && resource.meta && resource.meta.action
    return {
      ...resource,
      payload: resource.payload || defaultPayload,
      ready: !resource.busy,
      pendingFetch: pendingAction === 'fetch',
      pendingCreate: pendingAction === 'create',
      pendingUpdate: pendingAction === 'update',
      pendingDestroy: pendingAction === 'destroy'
    }
  }
}

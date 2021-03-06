import defaultTransform from './defaultTransform'
import * as types from './actionTypes'

const initialState = {}

function reset (state, action) {
  const { payload, meta } = action

  if (payload === undefined) {
    const newState = { ...state }
    delete newState[meta.resourceName]
    return newState
  }

  const resource = { initialized: true, busy: false, payload, previous: null, meta }
  return { ...state, [meta.resourceName]: resource }
}

function pending (state, action) {
  const { payload, meta } = action
  const previousState = state[meta.resourceName]
  const transformer = (fn, val) => fn(val, previousState && previousState.payload, false, meta)
  const transforms = meta.definition.transform || defaultTransform
  const transformedPayload = Array.isArray(transforms)
    ? transforms.reduce((memo, transform) => transformer(transform, memo), payload)
    : transformer(transforms, payload)

  const resource = {
    initialized: (previousState && previousState.initialized) || false,
    busy: true,
    payload: transformedPayload,
    previous: previousState && previousState.payload,
    meta
  }

  return { ...state, [meta.resourceName]: resource }
}

function fulfilled (state, action) {
  const { meta, payload } = action
  const previousState = state[meta.resourceName]
  const transformer = (fn, val) => fn(val, previousState && previousState.payload, true, meta)
  const transforms = meta.definition.transform || defaultTransform
  const transformedPayload = Array.isArray(transforms)
    ? transforms.reduce((memo, transform) => transformer(transform, memo), payload)
    : transformer(transforms, payload)

  const resource = {
    initialized: true,
    busy: false,
    payload: transformedPayload,
    previous: null,
    meta
  }

  return { ...state, [meta.resourceName]: resource }
}

function rejected (state, action) {
  const { meta, payload } = action
  const previousState = state[meta.resourceName]
  const resource = {
    initialized: (previousState && previousState.initialized) || false,
    busy: false,
    payload: previousState.payload,
    previous: null,
    error: payload,
    meta
  }

  return { ...state, [meta.resourceName]: resource }
}

function clearErrors (state, action) {
  const { resourceName } = action.meta
  const resource = state[resourceName]

  return { ...state, [resourceName]: { ...resource, error: null } }
}

const handlers = {
  [types.RESET]: reset,
  [types.PENDING]: pending,
  [types.FULFILLED]: fulfilled,
  [types.REJECTED]: rejected,
  [types.CLEAR_ERRORS]: clearErrors
}

export default function reducer (state = initialState, action) {
  const { type, meta } = action
  if (!type || !type.startsWith(types.PREFIX)) return state
  if (type === types.NUKE) return {}
  if (!meta || !meta.resourceName) {
    throw new Error(`Invalid ${type}: Missing "meta.resourceName" property`)
  }

  if (handlers[type]) {
    return handlers[type](state, action)
  } else {
    throw new Error(`Unrecognized action type: ${type}`)
  }
}

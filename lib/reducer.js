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
  const previous = state[meta.resourceName] && state[meta.resourceName].payload
  const transformer = (fn, val) => fn(val, previous, false, meta)
  const transforms = meta.definition.transform || defaultTransform
  const transformedPayload = Array.isArray(transforms)
    ? transforms.reduce((memo, transform) => transformer(transform, memo), payload)
    : transformer(transforms, payload)

  const resource = {
    initialized: true,
    busy: true,
    payload: transformedPayload,
    previous,
    meta
  }

  return { ...state, [meta.resourceName]: resource }
}

function fulfilled (state, action) {
  const { meta, payload } = action
  const previousState = state[meta.resourceName]
  const transformer = (fn, val) => fn(val, previousState.payload, true, meta)
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
    initialized: true,
    busy: false,
    payload: previousState.payload,
    previous: null,
    error: payload,
    meta
  }

  return { ...state, [meta.resourceName]: resource }
}

export default function reducer (state = initialState, action) {
  const { type, meta } = action
  if (!type || !type.startsWith(types.PREFIX)) return state
  if (type === types.NUKE) return {}
  if (!meta || !meta.resourceName) {
    throw new Error(`Invalid ${type}: Missing "meta.resourceName" property`)
  }

  switch (type) {
    case types.RESET: return reset(state, action)
    case types.PENDING: return pending(state, action)
    case types.FULFILLED: return fulfilled(state, action)
    case types.REJECTED: return rejected(state, action)
    default: throw new Error(`Unrecognized action type: ${type}`)
  }
}

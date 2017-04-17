import defaultTransform from './defaultTransform'
import * as types from './actionTypes'

const initialState = {}

export default function reducer (state = initialState, { type, payload, meta }) {
  if (!type || !type.startsWith(types.PREFIX)) {
    return state
  }

  if (type === types.NUKE) return {}

  if (!meta || !meta.resourceName) {
    throw new Error(`Invalid ${type}: Missing "meta.resourceName" property`)
  }

  switch (type) {
    case types.RESET: {
      if (payload === undefined) {
        const newState = { ...state }
        delete newState[meta.resourceName]
        return newState
      }

      const resource = { initialized: true, busy: false, payload, previous: null, meta }
      return { ...state, [meta.resourceName]: resource }
    }

    case types.PENDING: {
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

    case types.FULFILLED: {
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

    case types.REJECTED: {
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

    default:
      throw new Error(`Unrecognized action type: ${type}`)
  }
}

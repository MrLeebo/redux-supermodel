const initialState = {}

export default function reducer (state = initialState, { type, payload, meta }) {
  if (!type || !type.startsWith('@@redux-supermodel/')) {
    return state
  }

  if (type === '@@redux-supermodel/NUKE') return {}

  if (!meta || !meta.resourceName) {
    throw new Error(`Invalid ${type}: Missing "meta.resourceName" property`)
  }

  switch (type) {
    case '@@redux-supermodel/RESET': {
      if (payload === undefined) {
        const newState = { ...state }
        delete newState[meta.resourceName]
        return newState
      }

      const resource = { initialized: true, busy: false, payload, previous: null }
      return { ...state, [meta.resourceName]: resource }
    }

    case '@@redux-supermodel/REQUEST_PENDING': {
      const previous = state[meta.resourceName] && state[meta.resourceName].payload
      const resource = { initialized: true, busy: true, payload, previous }
      return { ...state, [meta.resourceName]: resource }
    }

    case '@@redux-supermodel/REQUEST_FULFILLED': {
      const resource = { initialized: true, busy: false, payload, previous: null }
      return { ...state, [meta.resourceName]: resource }
    }

    case '@@redux-supermodel/REQUEST_REJECTED': {
      const previous = state[meta.resourceName] && state[meta.resourceName].previous
      const resource = { initialized: true, busy: false, payload: previous, previous: null, error: payload }
      return { ...state, [meta.resourceName]: resource }
    }

    default:
      throw new Error(`Unrecognized action type: ${type}`)
  }
}

import findIndex from './utils/findIndex'

function getPreviousData (previous) {
  return (previous && previous.data && previous.data.slice(0)) || []
}

export default function collectionTransform (payload, previous, isFulfilled, meta = {}) {
  const { action, definition, inputData } = meta

  const getId = data => data[(definition && definition.idAttribute) || 'id']

  function create () {
    if (!isFulfilled) return previous

    const data = getPreviousData(previous)
    data.push(payload.data)

    return { ...previous, data }
  }

  function update () {
    if (!isFulfilled || !inputData) return previous

    const data = getPreviousData(previous)
    const index = findIndex(data, x => getId(x) === getId(inputData))
    if (index >= 0) {
      data[index] = { ...data[index], ...payload.data }
    }

    return { ...payload, data }
  }

  function destroy () {
    if (!inputData) return previous

    let data = getPreviousData(previous)
    if (isFulfilled) {
      data = data.filter(x => getId(x) !== getId(inputData))
      return { ...payload, data }
    }

    const index = findIndex(data, x => getId(x) === getId(inputData))
    if (index >= 0) {
      data[index] = { ...data[index], pendingDelete: true }
    }

    return { ...previous, data }
  }

  switch (action) {
    case 'create': return create()
    case 'update': return update()
    case 'destroy': return destroy()
    default: return isFulfilled ? payload : previous
  }
}

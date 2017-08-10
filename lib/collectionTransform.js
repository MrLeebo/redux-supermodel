import findIndex from './utils/findIndex'

function getPreviousData (previous) {
  return (previous && previous.data && previous.data.slice(0)) || []
}

function create (payload, previous, isFulfilled) {
  if (!isFulfilled) {
    return previous
  }

  const data = getPreviousData(previous)
  data.push(payload.data)

  return { ...previous, data }
}

function update (payload, previous, isFulfilled, {inputData}) {
  if (!isFulfilled || !inputData) return previous

  const data = getPreviousData(previous)
  const index = findIndex(data, x => x.id === inputData.id)
  if (index >= 0) {
    data[index] = { ...data[index], ...payload.data }
  }

  return { ...payload, data }
}

function destroy (payload, previous, isFulfilled, {inputData}) {
  if (!inputData) return previous

  let data = getPreviousData(previous)
  if (isFulfilled) {
    data = data.filter(x => x.id !== inputData.id)
    return { ...payload, data }
  }

  const index = findIndex(data, x => x.id === inputData.id)
  if (index >= 0) {
    data[index] = { ...data[index], pendingDelete: true }
  }

  return { ...previous, data }
}

export default function collectionTransform (payload, previous, isFulfilled, meta = {}) {
  switch (meta.action) {
    case 'create': return create(payload, previous, isFulfilled)
    case 'update': return update(payload, previous, isFulfilled, meta)
    case 'destroy': return destroy(payload, previous, isFulfilled, meta)
    default: return isFulfilled ? payload : previous
  }
}

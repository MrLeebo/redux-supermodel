import findIndex from './utils/findIndex'

export default function collectionTransform (payload, previous, isFulfilled, meta = {}) {
  const { action, inputData } = meta
  const getPreviousData = () => (previous && previous.data && previous.data.slice(0)) || []

  switch (action) {
    case 'create': {
      if (!isFulfilled) {
        return previous
      }

      const data = getPreviousData()
      data.push(payload.data)

      return { ...previous, data }
    }
    case 'update': {
      if (!isFulfilled) {
        return previous
      }

      if (!inputData) {
        return previous
      }

      const data = getPreviousData()
      const index = findIndex(data, x => x.id === inputData.id)
      if (index >= 0) {
        data[index] = { ...data[index], ...payload.data }
      }

      return { ...payload, data }
    }
    case 'destroy': {
      if (!inputData) {
        return previous
      }

      let data = getPreviousData()
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
    default:
      return isFulfilled ? payload : previous
  }
}

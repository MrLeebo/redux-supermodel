/*
 * Applied to the output of redux-logger to show the details of the redux-supermodel actions if available
 */

export default function logTitleFormatter ({ type, meta }, time, took) {
  const timePart = time || ''
  const tookPart = took ? `(in ${took.toFixed(2)} ms)` : ''

  if (type.startsWith('@@redux-supermodel/') && meta && meta.resourceName) {
    if (meta.url && meta.method) {
      return `action @ ${timePart} ${type} ${meta.resourceName} (${meta.method.toUpperCase()} ${meta.url}) ${tookPart}`
    }

    return `action @ ${timePart} ${type} ${meta.resourceName} ${tookPart}`
  }

  return `action @ ${timePart} ${type} ${tookPart}`
}

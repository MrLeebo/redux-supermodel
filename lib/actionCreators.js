import defaultAgent from 'axios'
import * as types from './actionTypes'
import propType from './propType'

export const actionMap = { fetch: 'get', create: 'post', update: 'put', destroy: 'delete' }

function urlAppend (...parts) {
  const [first, ...rest] = parts
  return rest.reduce((memo, str) => memo.replace(/[^/]$/, '$&/') + str.replace(/^\/|\/$/g, ''), first)
}

export function nuke () {
  return { type: types.NUKE }
}

export function resourceActionCreators (baseUrl, resourceName, definition, options = {}) {
  if (!definition) {
    throw new Error('Resource definition required')
  }

  const { idAttribute = 'id', url, urlRoot, rootParam } = definition
  let { agent, before, ...rest } = options
  if (!agent) agent = defaultAgent

  if (!url && !urlRoot) {
    throw new Error('Invalid resource definition: Missing required field or function "url" or "urlRoot"')
  }

  const fn = (memo, action) => {
    const method = actionMap[action]

    let idUsed = false
    function getResourceUrl (data = {}) {
      function getResult (val) {
        return (typeof val === 'function' && val.call(definition, { data, method })) || val
      }

      if (urlRoot) {
        const part = getResult(urlRoot)
        const id = data[idAttribute]

        if (!id) {
          return urlAppend(baseUrl, part)
        }

        idUsed = true
        return urlAppend(baseUrl, part, encodeURIComponent(id))
      }

      const part = getResult(url)
      return urlAppend(baseUrl, part)
    }

    memo[action] = (inputData) => {
      if (inputData && inputData.nativeEvent) {
        inputData = undefined
      }

      const requestUrl = getResourceUrl(inputData)

      let data = inputData

      if (idUsed) {
        data = { ...data }
        delete data[idAttribute]
      }

      if (method !== 'get' && (rootParam === true || typeof rootParam === 'string')) {
        const rootLabel = rootParam === true ? resourceName : rootParam
        data = { [rootLabel]: data }
      }

      let config = {
        ...rest,
        url: requestUrl,
        method,
        [method === 'get' ? 'params' : 'data']: data
      }

      if (before) {
        config = before(config) || config
      }

      const payload = agent(config)

      return {
        type: types.REQUEST,
        payload,
        meta: { action, method, url: requestUrl, resourceName, inputData, definition }
      }
    }

    return memo
  }

  const resource = {
    reset (payload) {
      return {
        type: types.RESET,
        payload,
        meta: { resourceName, definition }
      }
    },
    propType
  }

  return Object.keys(actionMap).reduce(fn, resource)
}

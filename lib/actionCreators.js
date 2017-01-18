import defaultAgent from 'axios'

export const actionMap = { fetch: 'get', create: 'post', update: 'put', destroy: 'delete' }

function urlAppend (...parts) {
  const [first, ...rest] = parts
  return rest.reduce((memo, str) => memo.replace(/[^/]$/, '$&/') + str.replace(/^\/|\/$/g, ''), first)
}

export function nuke () {
  return { type: '@@redux-supermodel/NUKE' }
}

export function resourceActionCreators (baseUrl, resourceName, definition, options = {}) {
  if (!definition) {
    throw new Error('Resource definition required')
  }

  const { idAttribute, url, urlRoot } = definition
  let { agent, before, ...rest } = options
  if (!agent) agent = defaultAgent

  if (!url && !urlRoot) {
    throw new Error('Invalid resource definition: Missing required field or function "url" or "urlRoot"')
  }

  const fn = (memo, action) => {
    const method = actionMap[action] || action

    function getResourceUrl (data = {}) {
      if (urlRoot) {
        const part = (typeof urlRoot === 'function' && urlRoot.call(definition, method)) || urlRoot
        const id = data[idAttribute || 'id']

        if (!id) {
          return urlAppend(baseUrl, part)
        }

        return urlAppend(baseUrl, part, encodeURIComponent(id))
      }

      const part = (typeof url === 'function' && url.call(definition, method)) || url
      return urlAppend(baseUrl, part)
    }

    memo[action] = (data) => {
      const requestUrl = getResourceUrl(data)
      let config = { ...rest, data }
      if (before) {
        config = before(config) || config
      }

      const payload = agent[method](requestUrl, config)

      return {
        type: '@@redux-supermodel/REQUEST',
        payload,
        meta: { action, method, url: requestUrl, resourceName, definition }
      }
    }

    return memo
  }

  const resource = {
    reset (payload) {
      return {
        type: '@@redux-supermodel/RESET',
        payload,
        meta: { resourceName, definition }
      }
    }
  }

  return Object.keys(actionMap).reduce(fn, resource)
}

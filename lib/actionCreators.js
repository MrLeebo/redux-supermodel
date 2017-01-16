import defaultAgent from 'superagent'

export const actionMap = { fetch: 'get', create: 'post', update: 'put', destroy: 'delete' }

function urlAppend (...parts) {
  const [first, ...rest] = parts
  return rest.reduce((memo, str) => memo.replace(/[^/]$/, '$&/') + str.replace(/^\/|\/$/g, ''), first)
}

export function resourceActionCreators (baseUrl, resourceName, definition, options = {}) {
  if (!definition) {
    throw new Error('Resource definition required')
  }

  const { idAttribute, url, urlRoot } = definition
  const agent = options.agent || defaultAgent

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
      const req = agent[method](requestUrl).send(data)

      if (options.events) {
        const eventOptions = { data, method, url: requestUrl, definition }
        Object.keys(options.events).forEach((key) => {
          let handler = options.events[key]
          if (key === 'request') {
            handler = handler.bind(this, req, eventOptions)
          }

          req.on(key, handler)
        })
      }

      return {
        type: '@@redux-supermodel/REQUEST',
        payload: req.then(),
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

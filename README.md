# redux-supermodel

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/13429c5aaf274e1189e839675cb31969)](https://www.codacy.com/app/MrLeebo/redux-supermodel?utm_source=github.com&utm_medium=referral&utm_content=MrLeebo/redux-supermodel&utm_campaign=badger) [![Build Status](https://travis-ci.org/MrLeebo/redux-supermodel.svg?branch=master)](https://travis-ci.org/MrLeebo/redux-supermodel) [![dependencies Status](https://david-dm.org/MrLeebo/redux-supermodel/status.svg)](https://david-dm.org/MrLeebo/redux-supermodel) [![devDependencies Status](https://david-dm.org/MrLeebo/redux-supermodel/dev-status.svg)](https://david-dm.org/MrLeebo/redux-supermodel?type=dev)

Streamline the effort it takes for you to communicate between your [Redux](http://redux.js.org/) Store and a REST-like API. This is a package of action creator functions and reducers built with [axios](https://github.com/mzabriskie/axios) and [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware) that handle the resource state management for you... all you need is a URL!

## [API Reference](docs/api.md)

## Creating the Client

Clients encapsulate the API you are consuming. You can create a new client by providing the base URL for the API.

```js
import { createClient } from 'redux-supermodel'

const client = createClient('https://example.com/api/v1')
```

## Creating Resources

Within your client, you can start defining resources. Each Resource represents an endpoint that you can interact with.

```js
// The full URL will be https://example.com/api/v1/blogs
const blogs = client('blogs')

// https://example.com/api/v1/comments
const comments = client('comments')
```

## Connecting your Resource to your Component with Redux

Now that we have our ingredients, time to put everything together. We are going to use `mapDispatchToProps` and `bindActionCreators` to bind our action creators to the component and `mapStateToProps` to display the results.

```js
function MyComponent ({blogs, createBlog}) {
  const { ready, error, payload } = blogs

  if (!ready) return <div className="loading">Please wait...</div>
  if (error) return <div className="error">{error.message}</div>

  const rows = payload.data.map(blog => <tr><td>{blog.title}</td></tr>)
  return (
    <div>
      <div>
        <button onClick={() => createBlog({title: 'new blog'})}>
          Create
        </button>
      </div>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    blogs: blogs(state)
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    createBlog: blogs.create,
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent)
```

## Installation

```
npm install --save redux-supermodel redux-promise-middleware
```

You will need to add the `redux-promise-middleware` middleware and the `redux-supermodel` reducer to your Redux Store.

```js
// store.js

import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import { reducer as resource } from 'redux-supermodel'

const rootReducer = combineReducers({ resource })
export default compose(applyMiddleware(promiseMiddleware()))(createStore)(rootReducer)
```

## [API Reference](docs/api.md)

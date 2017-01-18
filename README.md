# redux-supermodel

Streamline the effort it takes for you to communicate between your [Redux](http://redux.js.org/) Store and a REST-like API. This is a package of action creator functions and reducers built with [axios](https://github.com/mzabriskie/axios) and [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware) that handle the resource state management for you... all you need is a URL!

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
  const { ready, error, payload } = blogs;

  if (!ready) return <div className="loading">Please wait...</div>
  if (error) return <div className="error">{error.message}</div>

  const rows = payload.body.map(blog => <tr><td>{blog.title}</td></tr>)
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
npm install --save redux-supermodel
```

You will need to add the `redux-promise-middleware` middleware and the `redux-supermodel` reducer to your Redux Store.

```
npm install --save redux-promise-middleware
```

```js
// store.js

import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { reducer as resource } from 'redux-supermodel'

const rootReducer = combineReducers({ resource });
export default compose(applyMiddleware(promiseMiddleware()))(createStore)(rootReducer);
```

Be sure to mount the reducer to the `resource` key. If for some reason you can't use that name and you must call it something else, you will need to pass the `mountedAt` option when you call the `mapStateToProps` resource state function:

```js
// store.js

import { reducer } from 'redux-supermodel'

const rootReducer = combineReducers({ apiResources: reducer })

// ...

function mapStateToProps (state) {
  return {
    blogs: blogs(state, { mountedAt: 'apiResources' })
  }
}
```

## API Reference

### `createClient(baseUrl, options) => object`

A function to create a new REST Client. Available options are:

- `agent : axios` By default **redux-supermodel** will use [axios](https://github.com/mzabriskie/axios) as its AJAX agent, but you can substitute a different implementation here or inject a mock agent for testing.
- `before : function(config) => config` A function to invoke before sending the request. Can be used to set-up authentication, headers, or other configuration steps. You will receive the axios request config object and should return a modified config object with your authentication token or other configuration changes.

All other options will be passed as config data to axios.

#### Authentication

Using the `before` function, you can set authentication information that applies to all of the resource calls for a particular client. In this example, we'll assume you already have a Redux store that can be imported from **store.js**.

Basic authentication:

```js
import { createClient } from 'redux-supermodel'
import { getState } from './store'

function before (config) {
  const { username, password } = getState().currentUser
  return { ...config, auth: { username, password } }
}

export default createClient('https://example.com/api/v1', { before })
```

Or using an authentication token:

```js
function before (config) {
  const { token } = getState().currentUser
  const headers = { ...config.headers, 'X-Auth-Token': token }
  return { ...config, headers }
}

export default createClient('https://example.com/api/v1', { before })
```

### createResource `client(name, options) => object`

A function to create a new Resource. Available options are:

- `url : string or function` This gets appended to the end of the Client `baseUrl` to build the URL that links to the endpoint
- `urlRoot : string or function` Like `url`, however if the request data contains an "id" it will be appended to the URL as well
- `idAttribute : string` Defaults to "id" but you can change it if your resource has another identifier
- `defaultPayload : anything` Sets the payload for before the resource has received anything from the server. Otherwise the payload will be `undefined`

#### Building URLs

If you don't set the URL, the default "url" option will be your resource's name

```js
// https://example.com/api/v1/blogs
blogs = client('blogs')
```

You can customize a resource's URL using the "url" option

```js
// https://example.com/api/v1/blogs.json
blogs = client('blogs', { url: 'blogs.json' })
```

If you use "urlRoot" instead of "url", it will append the "id" to the end of the url if it is part of the request data

```js
// https://example.com/api/v1/blogs/my-first-blog
blogs = client('blogs', { urlRoot: 'blogs' })
blogs.fetch({ id: 'my-first-blog' })
```

Lastly, we can redefine the "idAttribute" if our resource uses something other than "id" as the primary key

```js
// https://example.com/api/v1/blogs/my-first-blog
blogs = client('blogs', { urlRoot: 'blogs', idAttribute: 'slug' })
blogs.fetch({ slug: 'my-first-blog' })
```

### `resource(state, options) => object` State To Props Function

```js
function mapStateToProps (state) {
  return {
    blogs: blogs(state),
  }
}
```

The available options are:
- `mountedAt` Set this to the key you mounted the `redux-supermodel` reducer to in your Redux Store. Defaults to `"resource"`

When you call `client(name)` you are going to get back a resource that you can use as a function for connecting to the Redux store via `mapStateToProps`. All you need to do is pass the `state` parameter to the function. This will bind the resource's state to the `props` of your component.

The prop object will contain the following values:

- `ready` True if there are no AJAX requests pending and at least one request has finished
- `busy` True if an AJAX request is currently pending
- `error` If the request failed, the error goes here
- `payload` This is where the data from the server goes
- `previous` When an AJAX request is pending, the original payload goes here

#### Optimistic Updates

When an AJAX request is dispatched, the payload is optimistically updated with the input data. The original payload data is copied to the `previous` property. If the request succeeds, the new data from the server will overwrite the `payload`. If the request fails, the `previous` value will overwrite the `payload` and the response from the server will be stored in the `error` property.

### `resource` Action Creators

```js
function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    resetBlogs: blogs.reset,
    fetchBlogs: blogs.fetch,
    createBlog: blogs.create,
    updateBlog: blogs.update,
    destroyBlog: blogs.destroy
  }, dispatch)
}
```

#### AJAX Actions

The available AJAX action creators are `.fetch() => GET`, `.create() => POST`, `.update() => PUT`, and `.destroy() => DELETE`.

When invoked, they will create an action such as this:

```js
{
  type: '@@redux-supermodel/REQUEST',
  payload: req.promise(),
  meta: { action, method, url, resource },
}
```

Since the payload is a promise, this action will be handled by `redux-promise-middleware` which will generate actions for the state of the AJAX promise: `@@redux-supermodel/REQUEST_PENDING`, `@@redux-supermodel/REQUEST_FULFILLED`, and `@@redux-supermodel/REQUEST_REJECTED`

#### Reset

Reset is another action creator that will set the resource's payload to whatever you pass into it. You can use this to pre-load a resource's state or to dump everything when you unmount the component.

```js
// Assigns the resource state without making an AJAX call
this.props.resetBlogs([{ title: 'My first blog' }])
```

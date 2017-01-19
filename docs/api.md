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

function basicAuthenticate (config) {
  const { username, password } = getState().currentUser
  return { ...config, auth: { username, password } }
}

export default createClient('https://example.com/api/v1', { before: basicAuthentication })
```

Or using an authentication token:

```js
function tokenAuthentication (config) {
  const { token } = getState().currentUser
  const headers = { ...config.headers, 'X-Auth-Token': token }
  return { ...config, headers }
}

export default createClient('https://example.com/api/v1', { before: tokenAuthentication })
```

### createResource `client(name, options) => object`

A function to create a new Resource. Available options are:

- `url : string or function` This gets appended to the end of the Client `baseUrl` to build the URL that links to the endpoint
- `urlRoot : string or function` Like `url`, however if the request data contains an "id" it will be appended to the URL as well
- `idAttribute : string` Defaults to "id" but you can change it if your resource has another identifier
- `defaultPayload : any` Sets the payload for before the resource has received anything from the server. Otherwise the payload will be `undefined`
- `transform : function(state, isFulfilled, meta) => nextState` When your resource is about to receive data, you may include a transform function to describe how you want to store that data. The default behavior is an identity function, whatever data gets received is what gets stored in the state.

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

#### `resource(state, options) => object` State To Props Function

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

##### Mounting `redux-supermodel` to a different key than `"resource"`

If for some reason you can't use that name and you must call it something else, you can pass the `mountedAt` option when you call the `mapStateToProps` resource state function:

```js
// store.js

import { reducer } from 'redux-supermodel'

const rootReducer = combineReducers({ apiResources: reducer })

// SomeComponent.jsx

function mapStateToProps (state) {
  return {
    blogs: blogs(state, { mountedAt: 'apiResources' })
  }
}
```

#### Transformations

You can control how the server's response to your AJAX request gets stored in your resource's state by defining a transform function.

The transform function has the following signature:

```js
function transform (state, previousState, isFulfilled, meta) => nextState
```

These are the parameters you will receive

- `payload : any` The new payload of the resource. If `isFulfilled` is true, this will be the response from the server, otherwise it will be the input data from the request
- `previous : any` The old payload of the resource
- `isFulfilled : bool` True if the request has been fulfilled (i.e. the data came from the server). Otherwise the request is still pending and `state` contains the input data sent to the server.
- `meta : object` The action metadata

##### Optimistic Updates

When an AJAX request is dispatched, the current state of the resource does not change until the server responds. For some applications, such as form-bound models, you may want to update the state optimistically with the request data before the server response has been fulfilled. You can implement optimistic updates by defining the transform function as a simple identity function:

```js
const optimisticUpdates = x => x
blogs = client('blogs', { transform: optimisticUpdates })
```

##### Deleting an item from an index by marking it

Many REST-like endpoints will respond to a DELETE action with a `204 No Content` response, but you probably don't want to replace your resource payload with no content. One thing you can do is modify your resource payload in redux with a `deleted: true` value instead of removing it entirely. You can use a transform function to do that.

```js
function markDeleted (payload, previous, isFulfilled, meta) {
  // Unless you want to use Optimistic Updates, keep the previous
  // payload until the request is fulfilled.
  if (!isFulfilled) return previous

  // Instead of deleting the resource state from our Redux store
  // outright, copy the previous state and add the "deleted" flag
  // so it can be displayed as such in the UI (e.g. with a
  // strikethrough or something)
  if (meta.action == 'destroy') {
    const { id } = payload
    let { data } = previous
    const index = data && data.findIndex(x => x.id === id)

    if (index >= 0) {
      // Make a copy of the array because we don't want to modify
      // the existing reference
      data = data.slice(0)

      data[index] = { ...data[index], deleted: true }
      return { ...previous, data }
    }

    return previous
  }

  // For all other cases, take the new payload
  return payload
}

blogs = client('blogs', { transform: markDeleted })
```

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

If you call `reset()` without any parameters, it will destroy all of the state associated with your resource, it will be as if it was brand new.

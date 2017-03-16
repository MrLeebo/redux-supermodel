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

function basicAuthentication (config) {
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
- `transform : function(payload, previous, isFulfilled, meta) => nextPayload` When your resource is about to receive data, you may include a transform function to describe how you want to store that data. The default behavior is an identity function, whatever data gets received is what gets stored in the state.
- `rootParam : bool or string` **true** will use the resource name as the root, a **string value** will be used as the root, any other value will be ignored

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

When you `fetch` and pass in a parameter object, its values will be serialized into the URL.

```js
// https://example.com/api/v1/blogs?filter=recent
blogs = client('blogs')
blogs.fetch({ filter: 'recent' })
```

If you use "urlRoot" instead of "url", it will append the "id" to the end of the url if it is part of the request data

```js
// https://example.com/api/v1/blogs/my-first-blog
blogs = client('blogs', { urlRoot: 'blogs' })
blogs.fetch({ id: 'my-first-blog' })
```

Lastly, we can redefine the "idAttribute" if our resource uses something other than "id" as the primary key

```js
// https://example.com/api/v1/blogs/my-first-blog?sort_by=popularity
blogs = client('blogs', { urlRoot: 'blogs', idAttribute: 'slug' })
blogs.fetch({ slug: 'my-first-blog', sort_by: 'popularity' })
```

Non-fetch actions will serialize their parameters to the request body, not the query string. If you need to customize the URL, you can define `url` or `urlRoot` as a function.

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

- `initialized : bool` Becomes true the first time any action creator has been dispatched for this resource, false otherwise
- `ready : bool` True if there are no AJAX requests pending and at least one request has been dispatched
- `busy : bool` True if any AJAX request is currently pending
- `error : object` If the request failed, the error goes here. This is the axios error object, see [Handling Errors](https://github.com/mzabriskie/axios#handling-errors) for information
- `payload : anything` The resource data. After a successful AJAX request, the payload will be an axios [response](https://github.com/mzabriskie/axios#response-schema)
- `previous : anything` When an AJAX request is pending, the original payload is copied here. It will be copied back if the request gets rejected
- `pendingFetch : bool` True if there is a pending GET request
- `pendingCreate : bool` True if there is a pending POST request
- `pendingUpdate : bool` True if there is a pending PUT request
- `pendingDestroy : bool` True if there is a pending DELETE request

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
function transform (payload, previous, isFulfilled, meta) => nextPayload
```

These are the parameters you will receive

- `payload : any` The new payload of the resource. If `isFulfilled` is true, this will be the response from the server, otherwise it will be the input data from the request
- `previous : any` The old payload of the resource
- `isFulfilled : bool` True if the request has been fulfilled (i.e. the data came from the server). Otherwise the request is still pending and `payload` contains the input data sent to the server.
- `meta : object` The action metadata

##### Optimistic Updates

When an AJAX request is dispatched, the current payload of the resource does not change until the server responds. For some applications, such as form-bound models, you may want to update the payload optimistically with the request data before the server response has been fulfilled. You can implement optimistic updates by defining the transform function as a simple identity function:

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

  // Instead of deleting the resource payload from our Redux store
  // outright, copy the previous payload and add the "deleted" flag
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

#### `rootParam : bool or string`

Pass `rootParam: true` to wrap the input data inside an object with the resource name as the label:

```js
const client = createClient('http://example.com')
const users = client('users', { urlRoot: 'users.json', rootParam: true })

// POST http://example.com/users.json
//
// { users: { first: 'John', last: 'Doe' } }
store.dispatch(users.create({ first: 'John', last: 'Doe' }))
```

Otherwise pass a string as the label:

```js
const client = createClient('http://example.com')
const users = client('users', { rootParam: 'user' })

// POST http://example.com/users.json
//
// { user: { first: 'John', last: 'Doe' } }
store.dispatch(users.create({ first: 'John', last: 'Doe' }))
```

### [bindResource](docs/bindResource.md)

You can use `bindResource` to automatically wire up all of the resource props as well as "fetch on mount" and "reset on unmount" behavior for a component. This is useful for page-level components that are associated to a particular resource.

Please read [bindResource.md](docs/bindResource.md) for more details.

### Creating a Basic Component

When rendering your resource state, be sure to check the `ready` and `error` states before attempting to use the `payload`.

```js
import React from 'react'
import createClient from 'redux-supermodel'

const client = createClient('http://example.com/api')
const blogs = client('blogs')

export default function MyComponent ({blogs, createBlog}) {
  const { ready, error, payload } = blogs

  if (!ready) return <div className="loading">Please wait...</div>
  if (error) return <div className="error">{error.response.data}</div>

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

MyComponent.propTypes = {
  blogs: blogs.propType.isRequired,
  createBlog: React.PropTypes.func.isRequired
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

#### PropTypes

You can use the `propType` provided by **redux-supermodel** to verify that the prop your component is receiving is what it is supposed to be. There are two ways to reference `propType` in your components:

Via your resource definition object:

```js
const blogs = client('blogs')

// ...

MyComponent.propTypes = {
  blogs: blogs.propType
}
```

Or via an import if you don't have a reference to your resource in your component module:

```js
import { propType as resourcePropType } from 'redux-supermodel'

// ...

MyComponent.propTypes = {
  blogs: resourcePropType
}
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
  payload: requestAsPromise,
  meta: { action, method, url, resourceName, inputData, definition },
}
```

Since the payload is a promise, this action will be handled by `redux-promise-middleware` which will generate actions for the state of the AJAX promise: `@@redux-supermodel/REQUEST_PENDING`, `@@redux-supermodel/REQUEST_FULFILLED`, and `@@redux-supermodel/REQUEST_REJECTED`

#### Reset

Reset is another action creator that will set the resource's payload to whatever you pass into it. You can use this to pre-load a resource's state or to dump everything when you unmount the component.

```js
// Assigns the resource payload without making an AJAX call
this.props.resetBlogs([{ title: 'My first blog' }])
```

If you call `reset()` without any parameters, it will destroy the state associated with your resource, it will be as if it was brand new.

### Other action creators

#### :boom: NUKE :boom:

This action will completely obliterate the entire `redux-supermodel` store, restoring everything to the way it was when your application first loaded. Sounds like overkill, but you might find it useful when writing integration tests.

```js
import { nuke } from 'redux-supermodel'
import { dispatch } from './store'

dispatch(nuke) // burn, baby burn
```

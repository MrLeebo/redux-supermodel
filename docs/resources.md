## resources

A resource represents an endpoint from your API. You can create resources by calling the `client` you got from [createClient](docs/createClient.md) as a function. 

```js
import { createClient } from 'redux-supermodel'

const client = createClient('https://example.com/api')

// https://example.com/api/todos
export const todos = client('todos')

// https://example.com/api/posts.json
export const posts = client('posts', { url: 'posts.json' })
```

The rest of this document is going to go into more detail about how resources work, but if you're just browsing, you can skip all of the boring details and go directly to [bindResource](docs/bindResource.md) which will show you how to connect your new resource to your React components!

## `client(name, options)`

### Parameters

|parameter|type|required?|description|
|:---|:---|:---:|:---|
|name|string|:white_check_mark:|Name of the resource, which is also used as the URL unless it has been redefined.|
|options|object|:x:|See below.|

### Available Options

|option|type(s)|default|description|
|:---|:---|:---:|:---|
|url|string or function|resource name|This gets appended to the end of the `client` URL|
|urlRoot|string or function|`null`|Like url, however if the request data contains an `id` it will be appended to the URL as well|
|idAttribute|string|`'id'`|In case your resource uses a different key, use this option to change it|
|rootParam|boolean or string|`false`|`true` will use the resource name as the root, a string value will be used as the root, any other value will be ignored|

## Properties of a Resource

When you create a resource using the client function, you will receive a function that acts as a redux state selector, 
transforming your redux state into props that you can use to render your resource from your React components. 

```js
// resource as a redux state selector
const todos = client('todos')

export function mapStateToProps(state) {
  return { todos: todos(state) }
}

export default connect(mapStateToProps)(MyComponent)
```

When you map the resource to props in this way, these are the properties you will receive:

|prop|type|description|
|:---|:---:|:---|
|initialized|bool|**True** if any data has been fetched for this resource, **false** otherwise.|
|busy|bool|**True** if a request is currently pending, **false** otherwise.|
|payload|payload object|The resource response data, usually an *axios* response object.|
|previous|payload object|While a request is pending, the previous payload gets copied here. If the request fails, the previous payload replaces the failed payload.|
|meta|meta object|Contains miscellaneous metadata about the resource definition and the last request that was sent.|
|ready|bool|**True** if the resource is initialized and is not busy, **false** otherwise.|
|pendingFetch|bool|**True** if the current request is a fetch, **false** otherwise.|
|pendingCreate|bool|**True** if the current request is a create, **false** otherwise.|
|pendingUpdate|bool|**True** if the current request is an update, **false** otherwise.|
|pendingDestroy|bool|**True** if the current request is a destroy, **false** otherwise.|

The resource also contains action creators to dispatch AJAX requests and update the resource state in redux.

```js
export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetch: todos.fetch,
    create: todos.create,
    update: todos.update,
    destroy: todos.destroy
    reset: todos.reset
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent)
```

Each action creator (except for reset) is a promisified action creator where the promise is the AJAX request. 
The code above is equivalent to using `this.props.dispatch(todos.fetch())` from an event handler in your connected component, if you prefer that over writing a `mapDispatchToProps` function.


|action creator|description|
|:---|:---|
|resource.fetch|Performs a GET request|
|resource.create|Performs a POST request|
|resource.update|Performs a PUT request|
|resource.destroy|Performs a DELETE request|
|resource.reset|See below.|

Unlike the other action creators, **reset** is NOT a promise nor does it dispatch an AJAX request. 
Calling `todos.reset(payload)` will assign the new value to your resource's payload without interacting with the API at all.
If you call `reset()` without any parameters, it will restore your resources' redux state to its initial state, as if it were brand new.

### Building Resource URLs

When you define a `urlRoot`, any requests that send data containing an `id` attribute will have that value appended to the URL.

```js
const users = client('users', { urlRoot: 'users' })

// GET https://example.com/api/users/6
users.fetch({ id: 6 })
```

This can be combined with `idAttribute` to build the `urlRoot` based on a different attribute.

```js
const blogs = client('blogs', { urlRoot: 'blogs', idAttribute: 'slug' })

// GET https://example.com/api/blogs/my-first-blog
users.fetch({ slug: 'my-first-blog' })
```

You can also define `url` and `urlRoot` as functions and use the request data to customize the URL.

```js
const users = client('users', { url(data) { return `users/${data.loggedIn ? 'online' : 'offline'}` } }

// GET https://example.com/api/users/online
users.fetch({loggedIn: true})

// GET https://example.com/api/users/offline
users.fetch({loggedIn: false})
```

Otherwise, request data will simply be appended to the query string for GET requests or to the request body for other methods.

```js
const blogs = client('blogs')

// GET https://example.com/api/v1/blogs?filter=recent
blogs.fetch({ filter: 'recent' })
```

### Reading resource state

Even though your resource behaves like an object, it is also a function itself. 
When you call `resource(state)` where `state` is your Redux Store state, it will return several props to help you render your resource from your React component.
One way to do this is through the `mapStateToProps` function in your connected component's `connect()` decorator. Actions (Fetch, Create, Update, Destroy) can be bound with `mapDispatchToProps`.

```js
// TodoListContainer.jsx

import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { todos } from './resources'
import TodoList from './TodoList'

export function mapStateToProps(state) {
  return { todos: todos(state) }
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchList: todos.fetch,
    createNew: todos.create
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoList)
```

All of this put together will give you a TodoList component (defined elsewhere) that has several props (defined below) to render the state of the `todos` resource and two callback props `fetchList()` and `createNew()` which will execute the AJAX requests and update the state of the resource with the results.

This is a more in-depth picture of how resources work in redux, but you usually won't need to write up all of this code yourself. The [bindResource](docs/bindResource.md) higher-order component is here to help!

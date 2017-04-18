## resources

A resource represents an endpoint from your API. You can create resources by calling the `client` you got from [createClient](createClient.md) as a function. 

```js
import { createClient } from 'redux-supermodel'

const client = createClient('https://example.com/api')

// https://example.com/api/todos
export const todos = client('todos')

// https://example.com/api/posts.json
export const posts = client('posts', { url: 'posts.json' })
```

The rest of this document is going to go into more detail about how resources work, but if you're just browsing, you can skip all of the boring details and go directly to [bindResource](bindResource.md) which will show you how to connect your new resource to your React components!

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
|defaultPayload|any|`undefined`|The value of the resource's payload before it has been updated by making a request.|
|transform|function or function[]|(state, previousState, isFulfilled, meta) => isFulfilled ? state : previousState|An optional transform function to map the API data before saving it to the redux store. If an array of transform functions are provided, the output state of each will be used as the input state of the next.|

#### transform(state, previousState, isFulfilled, meta) => newState

|props|type|description|
|:---|:---:|:---|
|state|object|The new state, depending on **isFulfilled** this will either be the input data from the request, or the response data.|
|previousState|object|The current state before any changes have been made.|
|isFulfilled|bool|**True** if this state is coming from an AJAX response, **false** otherwise.|
|meta|meta object|Contains miscellaneous details about the input request, resource definition, and action creator. May change over time.|

##### Optimistic Updates

You can implement optimistic updates by defining `transform` as an identity function `{ transform: state => state }`.

## Resource Redux Selector

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

### Selector Parameters `resource(state, options)`

When you use a resource as a selector for your redux state (as shown above), here are the accepted parameters:

|name|type|required?|description|
|:---|:---:|:---:|:---|
|state|object|:white_check_mark:|The redux state, as received from connectors like `mapStateToProps`.|
|options|object|:x:|See below.|

##### Selector Options

|option|type|default|description|
|:---|:---:|:---:|:---|
|mountedAt|string|`'resource'`|This is the key which you bound the *redux-supermodel* reducer to in your redux store. I recommend to use the default, but if you changed it to something else, be sure to specify the new name here.|

### Properties of a Resource

When you map the resource to props in this way, these are the properties you will receive:

|prop|type|description|
|:---|:---:|:---|
|initialized|bool|**True** if any data has been fetched for this resource, **false** otherwise.|
|busy|bool|**True** if a request is currently pending, **false** otherwise.|
|payload|payload object|The resource response data, usually an *axios* [response](https://github.com/mzabriskie/axios#response-schema).|
|previous|payload object|While a request is pending, the previous payload gets copied here. If the request fails, the previous payload replaces the failed payload.|
|meta|meta object|Contains miscellaneous metadata about the resource definition and the last request that was sent.|
|ready|bool|**True** if the resource is initialized and is not busy, **false** otherwise.|
|error|object|This is an Axios error object, see [Handling Errors](https://github.com/mzabriskie/axios#handling-errors).|
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

This is a more in-depth picture of how resources work in redux, but you usually won't need to write up all of this code yourself. The [bindResource](bindResource.md) higher-order component is here to help!

## API Reference

### [createClient](createClient.md)

Creates a new REST Client.

```js
import { createClient } from 'redux-supermodel'
const client = createClient('https://example.com/api')
```

### [resources](resources.md)

A function to create a new Resource.

```js
const todos = client('todos', { urlRoot: 'todos' })

// GET https://example.com/api/todos/6
todos.fetch({ id: 6 })
```

Resources are lightweight enough that you can just define them inside your component files as you need them, but if you're going to be reusing resources then it is probably better to set them aside in a **./resources.js** file and import it in your components.

```js
// resources.js
import { createClient } from 'redux-supermodel'

const client = createClient('https://example.com/api')
export const todos = client('todos', { urlRoot: 'todos' })
export const posts = client('posts', { url: 'posts.json' })
export const users = client('users', { urlRoot: 'users', idAttribute: 'userId' })
```

Imported such as:

```js
import { todos, posts, users } from './resources'
```

Check the [documentation](resources.md) on resources for information about using resources and what kind of props they can offer for your React components.

### Creating a Basic Component

When rendering your resource state, be sure to check the `ready` and `error` states before attempting to use the `payload`.

```js
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createClient } from 'redux-supermodel'

const client = createClient('http://jsonplaceholder.typicode.com')
const todos = client.createCollection('todos', { urlRoot: 'todos' })

export class TodoList extends Component {
  componentDidMount = () => this.props.fetch()

  componentWillUnmount = () => this.props.reset()

  render () {
    const { create, ready, error, rows } = this.props
    if (!ready) return <div className="loading">Please wait...</div>
    if (error) return <div className="error">{error.response.data}</div>

    return (
      <div>
        <div>
          <button type="button" onClick={create}>
            Create
          </button>
        </div>
        <table>
          <tbody>{rows && rows.map(todo => <tr key={row.id}><td>{row.title}</td></tr>)}</tbody>
        </table>
      </div>
    )
  }
}

export mapProps = state => {
  const { ready, error, payload: { data } } = todos(state)
  return { ready, error, rows: data }
}

const actions = {
  fetch: todos.fetch,
  create: () => todos.create({ title: 'new item' }),
  reset: todos.reset,
}

export default connect(mapProps, actions)(TodoList)
```

#### PropTypes

If you pass your resource props directly to your component without transforming it first, you can use the `propType` provided by **redux-supermodel** to verify that the prop your component is receiving is what it is supposed to be. There are two ways to reference `propType` in your components:

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
const actions = {
  resetBlogs: blogs.reset,
  fetchBlogs: blogs.fetch,
  createBlog: blogs.create,
  updateBlog: blogs.update,
  destroyBlog: blogs.destroy
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

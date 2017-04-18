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

### [bindResource](docs/bindResource.md)

You can use `bindResource` to automatically wire up all of the resource props as well as "fetch on mount" and "reset on unmount" behavior for a component. This is useful for page-level components that are associated to a particular resource.

Please read [bindResource.md](docs/bindResource.md) for more details.

### Creating a Basic Component

When rendering your resource state, be sure to check the `ready` and `error` states before attempting to use the `payload`.

```js
import React from 'react'
import createClient from 'redux-supermodel'
import PropTypes from 'prop-types'

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
  createBlog: PropTypes.func.isRequired
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

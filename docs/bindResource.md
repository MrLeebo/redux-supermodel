## `bindResource(resources, options={})(WrappedComponent)`

This helper will bind an object full of resource definitions to a component. On mount, each resource will be fetched and on unmount each resource will be reset. In addition, the resource's state selector and dispatch action creators will be appended to the component's props.

When you write this:

```js
const post = client('post' { urlRoot: 'posts' })
export default bindResource({ post })(PostEditor)
```

The component `PostEditor` will receive all of these props:

- `post : { ready, error, payload }` The state selector value for the post resource
- `fetchPost`, `createPost`, `updatePost`, `destroyPost` The AJAX dispatch-bound action creators
- `resetPost` The dispatch-bound reset action creator
- `fetchAll` If the `resources` object had more than one resource, this will fetch all of them
- `resetAll` Like `fetchAll`, this will reset all of the bound resources to their default value

### `resources : object`

The `resources` param is just an object containing one or more resource definitions. To support multiple resources being bound to one component, the key name will be used in the prop names.

```js
const users = client('users')
const likes = client('likes')
const topics = client('topics')

bindResource({
  users,
  likes,
  topics
})(ComplexComponent)

// The state selector value and dispatch-bound action creators will be added to the component for each resource
// The resource key name will help you distinguish them, for instance:
//
// this.props.users.ready
// this.props.fetchUsers()
// this.props.likes.error
// this.props.createLikes()
// this.props.topics.payload
// this.props.destroyTopics()
//
// ... and so on.
```

### `options : object`

- `mount(props)` By default `bindResource` will fetch all of the resources, passing the component's props as the parameters. You can override that default with the mount function. See the examples below for details.

### Example `<PostEditor id={1} />`

This is an example using bindResource to connect a simple form to an AJAX endpoint.

```js
import React from 'react'
import { bindResource } from 'redux-supermodel'
import { post } from './api'

export function PostEditor ({ post, updatePost }) {
  const { ready, error, payload } = post

  if (!ready) return <div>Please wait...</div>
  if (error) return <div>{error.response.data}</div>

  function handleSubmit(e) {
    e.preventDefault()

    const { id, title, body } = e.target.elements
    updatePost({ id: id.value, title: title.value, body: body.value })
  }

  const { id, title, body } = payload.data
  return (
    <form onSubmit={handleSubmit}>
      Title: <input name="title" type="text" defaultValue={title} />
      Body: <textarea name="body" defaultValue={body} />

      <input name="id" type="hidden" value={id} />
      <button type="submit">Save</button>
    </form>
  )
}

export default bindResource({ post })(PostEditor)
```

You can change how the component will fetch the data using the `mount` option:

```js
export default bindResource({ post }, { mount(props) {
    props.fetchPost({ id: props.id })
  }
})(PostEditor)
```

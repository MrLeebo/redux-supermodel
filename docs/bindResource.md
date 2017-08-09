## bindResource

This helper will bind an object full of resource definitions to a component. On mount, each resource will be fetched and on unmount each resource will be reset. In addition, the resource's state selector and dispatch action creators will be appended to the component's props.

When you write this:

```jsx
const post = client('post' { urlRoot: 'posts' })
export default bindResource({ post })(PostEditor)
```

The component `PostEditor` will receive all of these props:

|prop|type|description|
|:---|:---|:---|
|post|[resource props](https://github.com/MrLeebo/redux-supermodel/blob/master/docs/resources.md#properties-of-a-resource)|The redux selector props for the post resource.|
|fetchPost|AJAX dispatch-bound action creator function|Invoke to fetch the post.|
|createPost|AJAX dispatch-bound action creator function|Invoke to create the post.|
|updatePost|AJAX dispatch-bound action creator function|Invoke to update the post.|
|destroyPost|AJAX dispatch-bound action creator function|Invoke to destroy the post.|
|fetchAll|function|In this example there is only one resource being bound (post), but if you had multiples then this callback would fetch all of them. This callback is used by *bindResource* when the component mounts.|
|resetAll|function|Like `fetchAll`, this will reset all of the resources bound to the component, and it is called automatically on unmount.|

## `bindResource(resources, options)(WrappedComponent)`

### Parameters

|parameter|type|required?|description|
|:---|:---:|:---:|:---|
|resources|object|:white_check_mark:|An object containing one or more resource definitions. The key name is appended to the prop names so that multiple resources can be bound without their props colliding.|
|options|object|:x:|See below.|

### Options

|option|type|default|description|
|:---|:---:|:---:|:---|
|mount|function|<code>props&nbsp;=>&nbsp;props.fetchAll()</code>|Will be invoked as part of the component lifecycle at `componentDidMount`. If an error is thrown, it will be handled by `onMountError`.|
|willReceiveProps|function|`undefined`|Will be invoked as part of the component lifecycle at `componentWillReceiveProps`. The parameters are <code>(props,&nbsp;nextProps)</code>|
|unmount|function|<code>props&nbsp;=>&nbsp;props.resetAll()</code>|Will be invoked as part of the component lifecycle at `comonentWillUnmount`. If an error is thrown, it will be handled by `onUnmountError`.|
|onMountError|function|`console.error`||
|onUnmountError|function|`console.error`||
|onWillReceivePropsError|function|`console.error`||
|mapProps|function||By default, bindResource will attach each resource as a prop of the component, but most components don't need to access every part of the resource. This option is equivalent to defining the `mapStateToProps` function on the `connect()` function.|
|mergeProps|function|<code>(stateProps,&nbsp;dispatchProps,&nbsp;ownProps)&nbsp;=> ({&nbsp;...ownProps,&nbsp;...dispatchProps,&nbsp;...stateProps&nbsp;}))</code>|Function where you can cherry pick props to pass to your component, calculate new computed props based on your resource state, and map/reduce your data to be ready for consumption by your Component.|
|connectOptions|object|`undefined`|Passed as the 4th parameter to the `connect()` function. See the [docs](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) for more information.|

### Example `<PostEditor id={1} />`

This is an example using bindResource to connect a simple form to an AJAX endpoint.

```jsx
import React from 'react'
import { bindResource } from 'redux-supermodel'
import { post } from './resources'

export function PostEditor ({ ready, error, id, title, body, updatePost }) {
  if (!ready) return <div>Please wait...</div>
  if (error) return <div>Something unexpected happened...</div>

  function handleSubmit (e) {
    e.preventDefault()
    const fields = e.target.elements

    updatePost({ 
      id: fields.id.value, 
      title: fields.title.value, 
      body: fields.body.value 
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      Title: <input name="title" type="text" defaultValue={title} />
      Body: <textarea name="body" defaultValue={body} />

      <input name="id" type="hidden" value={id} />
      <button type="submit">Save</button>
    </form>
  )
}

export function mount ({id, fetchPost}) {
  if (id) {
    return fetchPost({ id })
  }
}

export function mapProps (state) {
  const { 
    ready, error, payload: { data: { id, title, body } = {} } 
  } = post(state)
  return { ready, error, id, title, body }
}

export default bindResource({ post }, { mount, mapProps })(PostEditor)
```

### Mapping multiple resources at once

When you bind more than one resource to a component with `bindResource()`, the object key will be attached to each action name so that they don't all resolve to the same function names.

```jsx
const users = client('users')
const likes = client('likes')
const topics = client('topics')

export default bindResource({ users, likes, topics })(ComplexComponent)

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

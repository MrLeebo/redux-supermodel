# redux-supermodel

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/13429c5aaf274e1189e839675cb31969)](https://www.codacy.com/app/MrLeebo/redux-supermodel?utm_source=github.com&utm_medium=referral&utm_content=MrLeebo/redux-supermodel&utm_campaign=badger) [![Build Status](https://travis-ci.org/MrLeebo/redux-supermodel.svg?branch=master)](https://travis-ci.org/MrLeebo/redux-supermodel) [![dependencies Status](https://david-dm.org/MrLeebo/redux-supermodel/status.svg)](https://david-dm.org/MrLeebo/redux-supermodel) [![devDependencies Status](https://david-dm.org/MrLeebo/redux-supermodel/dev-status.svg)](https://david-dm.org/MrLeebo/redux-supermodel?type=dev)

Streamline the effort it takes for you to communicate between your [Redux](http://redux.js.org/) Store and a REST-like API. This is a package of action creator functions and reducers built with [axios](https://github.com/mzabriskie/axios) and [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware) that handle the resource state management for you... all you need is a URL!

#### [Check out the demo](https://mrleebo.github.io/redux-supermodel)

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

## Attaching your Resource's props to your Component

Start with your resource definition, let's pretend `http://example.com/api/posts/latest` will return a JSON object with properties `title` and `body`.

```js
// resources.js

import { createClient } from 'redux-supermodel'

const client = createClient('http://example.com/api')

// GET http://example.com/api/posts/latest
//
// { title: 'My latest blog post', body: 'Hello, world!' }
export const post = client('post', { url: 'posts/latest' }) 
```

The easiest way to use **redux-supermodel** is with the [bindResource](docs/bindResource.md) higher-order component which will automatically fetch the resource when the component mounts, reset it when the component unmounts, and binds the resource's props and action creators to the component's props. 

```js
// MyComponent.js

import React from 'react'
import { bindResource } from 'redux-supermodel'
import { post } from './resources'

function MyComponent ({ready, error, title, body, fetchPost}) {
  if (!ready) return <div className="loading">Loading...</div> 
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <h1>{title}</h1>
      <div className="body">
        {body}
      </div>
      <button type="button" onClick={() => fetchPost()}>Refresh</button>
    </div>
  )
}

export function mergeProps (stateProps, dispatchProps, ownProps) {
  const { 
    ready, 
    error, 
    payload
  } = stateProps.post

  const err = error && error.response && error.response.data
  const data = payload && payload.data

  // The stateProps parameter can get rather large and have lots of unwieldy data structures,
  // use mergeProps as an opportunity to be a bit selective and only return the stateProps
  // values that you are going to use in your component.
  //
  // The same advice also applies to dispatchProps and ownProps, to a lesser extent, its not as
  // important to do so in those cases because A) you will already be defining ownProps 
  // somewhere else in your app and B) the `bindResource` higher-order component will dispatch
  // some callbacks on your behalf (by default `fetchAll()` on mount and `resetAll()` on unmount)
  return { 
    ...ownProps, 
    ...dispatchProps, 
    ready, 
    error: err && err.message, 
    title: data && data.title, 
    body: data && data.body 
  }
}

const resources = { post }
export default bindResource(resources, { mergeProps })(MyComponent)
```

The advice offered by this [blog post](https://goshakkk.name/redux-antipattern-mapstatetoprops/) is about mapStateToProps, but it applies to how we are using mergeProps here.

For details on mergeProps, read the [react-redux connect()](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) documentation.

For the full list of options, see [bindResource](docs/bindResource.md).

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

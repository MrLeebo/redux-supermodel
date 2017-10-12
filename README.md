# redux-supermodel

[![BCH compliance](https://bettercodehub.com/edge/badge/MrLeebo/redux-supermodel?branch=master)](https://bettercodehub.com/)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/13429c5aaf274e1189e839675cb31969)](https://www.codacy.com/app/MrLeebo/redux-supermodel?utm_source=github.com&utm_medium=referral&utm_content=MrLeebo/redux-supermodel&utm_campaign=badger) 
[![Build Status](https://travis-ci.org/MrLeebo/redux-supermodel.svg?branch=master)](https://travis-ci.org/MrLeebo/redux-supermodel) 
[![dependencies Status](https://david-dm.org/MrLeebo/redux-supermodel/status.svg)](https://david-dm.org/MrLeebo/redux-supermodel) 
[![devDependencies Status](https://david-dm.org/MrLeebo/redux-supermodel/dev-status.svg)](https://david-dm.org/MrLeebo/redux-supermodel?type=dev)

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

You can use the `connect` Higher-Order Component to attach your resource state to your component and bind any action creators you want to use. Most of the time, you will be fetching something when the component mounts. If this is the only component that will use the resource, you can reset it when the component unmounts. Usually `create` and `update` action creators will be bound to the button or submit handlers on your form.

```jsx
// MyComponent.js

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { post } from './resources'

export class MyComponent extends Component {
  async componentDidMount() {    
    try {
      const res = await this.props.fetchPost()
      
      // AJAX action creators are promises, so you can await on them to 
      // handle errors or do something after they finish.
      console.log(res)
    } catch (error) {
      // redux-supermodel will track the error state for you, but 
      // you can also do your own thing.
      alert('Something bad happened!')
    }
  }
  
  componentWillUnmount() {
    // If you only ever access a resource within the context of a single component and
    // its children, you can reset the resource on unmount to clean up your redux state.
    this.props.resetPost()
  }

  render() {
    const { initialized, error, title, body, fetchPost } = props
    
    if (!initialized) {
      if (error) {
        return <div className="error">{error.message}</div>
      } else {
        return <div className="loading">Loading...</div> 
      }
    }

    return (
      <div>
        <h1>{title}</h1>
        <div className="body">
          {body}
        </div>

        <div className="error">
          {error.message}
        </div>

        <button type="button" onClick={fetchPost}>Refresh</button>
      </div>
    )
  }
}

export function mapProps (state) {
  const { ready, error, payload } = post(state)
  const { data: { title, body } = {} } = payload
  return { ready, error, title, body }
}

const actions = { 
  fetchPost: () => post.fetch({ id: 'latest' }),
  resetPost: post.reset,
}

export default connect(mapProps, actions)(MyComponent)
```

The payload can be a massive object containing lots of information about the HTTP request and response, most of which you aren't going to need when you're rendering your component, so I suggest using the `mapProps` call to simplify the payload to just the stuff you're going to need. Try to avoid using payload directly. Check out this [blog post](https://goshakkk.name/redux-antipattern-mapstatetoprops/) for further reading.

For details on mapProps, read the [react-redux connect()](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) documentation.

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

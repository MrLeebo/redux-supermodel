import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import Home from './Home'
import Navbar from './Navbar'
import PostContainer from './PostContainer'
import PostsContainer from './PostsContainer'
import TodoListContainer from './TodoListContainer'

class App extends Component {
  render () {
    return (
      <div className='App'>
        <Navbar />

        <div className='container'>
          <Route path='/' exact component={Home} />
          <Route path='/posts/:id' component={PostContainer} />
          <Route path='/posts' exact component={PostsContainer} />
          <Route path='/todoList' component={TodoListContainer} />
        </div>
      </div>
    )
  }
}

export default App

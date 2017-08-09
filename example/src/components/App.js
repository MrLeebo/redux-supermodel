import React from 'react'
import { Route } from 'react-router-dom'

import Home from './Home'
import Navbar from './Navbar'
import PostDetailPage from './PostDetailPage'
import PostListPage from './PostListPage'
import TodoListPage from './TodoListPage'

export default function App () {
  return (
    <div className='App'>
      <Navbar />

      <div className='container'>
        <Route path='/' exact component={Home} />
        <Route path='/posts/:id' component={PostDetailPage} />
        <Route path='/posts' exact component={PostListPage} />
        <Route path='/todoList' component={TodoListPage} />
      </div>
    </div>
  )
}

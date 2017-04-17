import React from 'react'
import { Link } from 'react-router-dom'

export default function Home () {
  return (
    <div>
      <h2>Demos</h2>
      <ul className='list-unstyled'>
        <li><Link to='/posts'>posts</Link></li>
        <li><Link to='/todoList'>todo list</Link></li>
      </ul>
    </div>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar () {
  return (
    <nav className='navbar navbar-default navbar-fixed-top'>
      <div className='container'>
        <div className='header row'>
          <ul className='list-inline'>
            <li>
              <span className='lead'>redux-supermodel</span>
            </li>
            <li>
              <Link to='/posts'>posts</Link>
            </li>
            <li>
              <Link to='/todoList'>todo list</Link>
            </li>
            <li className='pull-right'>
              <a className='btn btn-default' href='https://github.com/MrLeebo/redux-supermodel'>
                <i className='fa fa-github' />
              </a>
            </li>
            <li className='pull-right'>
              <small>
                (Don't forget to turn on
                the <a href='https://github.com/zalmoxisus/redux-devtools-extension'>Redux DevTools</a> extension.)
              </small>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

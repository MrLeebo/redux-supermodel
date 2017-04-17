import React from 'react'
import { Link } from 'react-router-dom'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostListPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/bindResource.md'

export default function PostListPage ({ rows }) {
  return (
    <div className='container'>
      <div>
        <h1>
          <ul className='list-inline'>
            <li>posts</li>
            <li><a target='_blank' href={source}><small>view source</small></a></li>
            <li className='pull-right'><a target='_blank' href={documentation}><small>documentation</small></a></li>
          </ul>
          <p className='lead'>
            Uses <a target='_blank' href={documentation}><code>bindResource</code></a> to retrieve a list of posts, rendering links to each entry.
          </p>
        </h1>
      </div>
      <hr />

      <table className='table table-striped table-condensed'>
        <thead>
          <tr>
            <th>Post</th>
          </tr>
        </thead>
        <tbody>
          {rows && rows.map(({id, title}) => <tr key={id}><td><Link to={`/posts/${id}`}>{title}</Link></td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

import React from 'react'
import { bindResource } from 'redux-supermodel'
import { Link } from 'react-router-dom'
import { posts } from '../lib/resources'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostListPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/bindResource.md'

export function PostListPage (props) {
  const { ready, error, data, fetchPosts } = props
  if (!ready) return <i className='fa fa-refresh fa-spin' />
  if (error) return <i className='text-danger'>An error occurred: {error.message}</i>

  return (
    <div className='container'>
      <div>
        <h1>
          <ul className='list-inline'>
            <li>posts</li>
            <li><a target='_blank' href={source}><small>view source</small></a></li>
            <li className='pull-right'><a target='_blank' href={documentation}><small>documentation</small></a></li>
          </ul>

          <div className="pull-right">
            <button onClick={fetchPosts} className="btn btn-default">Refresh</button>
          </div>

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
          {data.map(({id, title}) => <tr key={id}><td><Link to={`/posts/${id}`}>{title}</Link></td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

export function mapProps (state) {
  const { ready, error, payload: { data = [] } } = posts(state)
  return { ready, error, data }
}

export default bindResource({posts}, {mapProps})(PostListPage)

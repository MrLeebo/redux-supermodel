import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import resources from '../lib/resources'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostListPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md#resources'

export class PostListPage extends Component {
  componentDidMount = () => this.props.fetch()

  componentWillUnmount = () => this.props.reset()

  render () {
    const { ready, error, data, fetch } = this.props
    if (!ready) return <i className='fa fa-refresh fa-spin' />
    if (error) return <i className='text-danger'>An error occurred: {error.message}</i>

    const colgroup = (
      <colgroup>
        <col style={{ width: '1*' }} />
        <col style={{ width: 300 }} />
        <col style={{ width: 200 }} />
      </colgroup>
    )

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
              <button onClick={fetch} className="btn btn-default">Refresh</button> <Link to="/posts/new" className="btn btn-success">Create New Post</Link>
            </div>

            <p className='lead'>
              Uses a <a target='_blank' href={documentation}><code>resource</code></a> to retrieve a list of posts, rendering links to each entry.
            </p>
          </h1>
        </div>
        <hr />

        <table className="table table-heading">
          {colgroup}
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Posted On</th>
            </tr>
          </thead>
        </table>

        <div className="table-body">
          <table className='table table-striped table-condensed'>
            {colgroup}
            <tbody>
              {data.map(({id, title, author, posted}) => (
                <tr key={id}>
                  <td><Link to={`/posts/${id}`}>{title}</Link></td>
                  <td>{author}</td>
                  <td className="text-muted">{new Date(posted).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export function mapProps (state) {
  const { ready, error, payload: { data } } = resources.posts(state)
  return { ready, error, data: data || [] }
}

const actions = {
  fetch: resources.posts.fetch,
  reset: resources.posts.reset,
}

export default connect(mapProps, actions)(PostListPage)

import React from 'react'
import { bindResource } from 'redux-supermodel'
import { Link } from 'react-router-dom'
import { posts } from '../lib/resources'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostDetailPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/bindResource.md'

export function PostDetailPage ({ ready, error, id, title, body }) {
  if (!ready) return <i className='fa fa-refresh fa-spin' />
  if (error) return <i className='text-danger'>An error occurred: {error.message}</i>

  return (
    <form className='form form-horizontal'>
      <div>
        <h1>
          <ul className='list-inline'>
            <li>view post</li>
            <li><a target='_blank' href={source}><small>view source</small></a></li>
            <li className='pull-right'><a target='_blank' href={documentation}><small>documentation</small></a></li>
          </ul>

          <div className='pull-right'>
            <Link to='/posts' className='btn btn-default'>Back</Link>
            &nbsp;
            <Link to={`/posts/${id + 1}`} className='btn btn-default'>Next</Link>
            &nbsp;
            <Link to={`/posts/${id - 1}`} className='btn btn-default'>Previous</Link>
          </div>

          <p className='lead'>
            Uses <a target='_blank' href={documentation}><code>bindResource</code></a> to fetch the post details.
          </p>
        </h1>
      </div>
      <hr />

      <input type='hidden' name='id' value={id} />

      <div className='form-group'>
        <label className='control-label col-md-1'>Title</label>
        <div className='col-md-11'>
          <input type='text' name='title' defaultValue={title} className='form-control' readOnly />
        </div>
      </div>

      <div className='form-group'>
        <label className='control-label col-md-1'>Body</label>
        <div className='col-md-11'>
          <textarea name='body' defaultValue={body} className='form-control' rows={6} readOnly />
        </div>
      </div>
    </form>
  )
}

export function mapProps (state) {
  const { ready, error, payload } = posts(state)
  const { data: { id, title, body } = {} } = payload
  return { ready, error, id, title, body }
}

export function mount (props) {
  const { match, fetchPosts } = props
  return fetchPosts({ id: match.params.id })
}

export function willReceiveProps (props, nextProps) {
  if (props.match.params.id !== nextProps.match.params.id) {
    mount(nextProps)
  }
}

export default bindResource({posts}, {mapProps, mount, willReceiveProps})(PostDetailPage)

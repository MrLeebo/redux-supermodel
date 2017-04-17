import React from 'react'
import { Link } from 'react-router-dom'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostDetailPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/bindResource.md'

export default function PostDetailPage ({ id, title, body }) {
  if (!id) return <i className='fa fa-refresh fa-spin' />

  return (
    <form className='form form-horizontal'>
      <div>
        <h1>
          <ul className='list-inline'>
            <li>view post</li>
            <li><a target='_blank' href={source}><small>view source</small></a></li>
            <li className='pull-right'><a target='_blank' href={documentation}><small>documentation</small></a></li>
          </ul>

          <Link to='/posts' className='btn btn-default pull-right'>Back</Link>
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

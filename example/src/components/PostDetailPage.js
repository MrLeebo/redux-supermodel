import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import resources from '../lib/resources'
const { posts } = resources

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostDetailPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md#resources'

export class PostDetailPage extends Component {
  componentDidMount = () => this.fetchPost(this.props)

  componentWillReceiveProps = nextProps => {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.fetchPost(nextProps)
    }
  }

  componentWillUnmount = () => this.props.reset()

  fetchPost = props => props.fetch(props.match.params.id)

  render () {
    const { ready, error, id, title, body } = this.props

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
            </div>

            <p className='lead'>
              Fetches a post <a target='_blank' href={documentation}><code>resource</code></a> to show details.
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

        <div>
          {id < 100 && <Link to={`/posts/${id + 1}`} className='btn btn-default pull-right'>Next</Link>}
          {id > 1 && <Link to={`/posts/${id - 1}`} className='btn btn-default pull-left'>Previous</Link>}
        </div>
      </form>
    )
  }
}

export function mapProps (state) {
  const { ready, error, payload } = posts(state)
  const { data: { id, title, body } = {} } = payload
  return { ready, error, id, title, body }
}

const actions = {
  fetch: id => posts.fetch({id}),
  reset: posts.reset,
}

export default connect(mapProps, actions)(PostDetailPage)

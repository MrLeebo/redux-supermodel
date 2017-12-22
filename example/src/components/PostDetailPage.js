import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import resources from '../lib/resources'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/PostDetailPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md#resources'

const FormGroup = ({label, children}) => (
  <div className='form-group'>
    <label className='control-label col-md-1'>{label}</label>
    <div className='col-md-11'>
      {children}
    </div>
  </div>
)

export class PostDetailPage extends Component {
  componentDidMount = () => {
    if (this.props.match.params.id !== 'new') {
      this.fetchPost(this.props)
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.fetchPost(nextProps)
    }
  }

  componentWillUnmount = () => this.props.reset()

  fetchPost = props => props.fetch(props.match.params.id)

  submit = async e => {
    e.preventDefault()

    const {
      id, title, author, body
    } = document.forms.details

    const res = await this.props.save({
      id: id.value,
      title: title.value,
      author: author.value,
      body: body.value
    })

    this.props.history.replace(`/posts/${res.value.data.id}`)
  }

  render () {
    const { match, ready, error, id, title, author, body } = this.props

    if (!ready && match.params.id !== 'new') return <i className='fa fa-refresh fa-spin' />
    if (error) return <i className='text-danger'>An error occurred: {error.message}</i>

    return (
      <form name="details" className='form form-horizontal' onSubmit={this.submit}>
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

        <input type='hidden' name='id' defaultValue={id} />

        <FormGroup label="Title">
          <input type='text' name="title" defaultValue={title} className='form-control' />
        </FormGroup>

        <FormGroup label="Author">
          <input type='text' name="author" defaultValue={author} className='form-control' />
        </FormGroup>

        <FormGroup label="Body">
          <textarea name='body' defaultValue={body} className='form-control' rows={6} />
        </FormGroup>

        <FormGroup>
          <button type="submit" className="btn btn-primary">Submit</button>
        </FormGroup>
      </form>
    )
  }
}

export function mapProps (state) {
  const { ready, error, payload } = resources.post(state)
  const { data = {} } = payload
  return { ready, error, ...data }
}

const actions = {
  fetch: id => resources.post.fetch({id}),
  save: values => resources.post[values.id ? 'update' : 'create'](values),
  reset: resources.post.reset,
}

export default connect(mapProps, actions)(PostDetailPage)

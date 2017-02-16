import React from 'react'
import bindResource from '../../lib/bindResource'

export function PostEditor ({ post, updatePost }) {
  const { ready, error, payload } = post

  if (!ready) return <div>Please wait...</div>
  if (error) return <div>{error.response.data}</div>

  function handleSubmit (e) {
    e.preventDefault()

    const { id, title, body } = e.target.elements
    updatePost({ id: id.value, title: title.value, body: body.value })
  }

  const { id, title, body } = payload.data
  return (
    <form onSubmit={handleSubmit}>
      Title: <input name='title' type='text' defaultValue={title} />
      Body: <textarea name='body' defaultValue={body} />

      <input name='id' type='hidden' value={id} />
      <button type='submit'>Save</button>
    </form>
  )
}

export default function withPost (post) {
  return bindResource({ post })(PostEditor)
}

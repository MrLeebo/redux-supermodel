## `createClient(url, options)`

This is your entry point into *redux-supermodel*. First you create your client, and with that you can create [resources](resources.md) that belong to that client. Resources represent the actual API endpoints you are going to be interacting with. 
The client is responsible for authentication logic, proxies, custom headers, or any other configuration steps necessary to interact with your API.

### Parameters
|parameter|type|default|description|
| :--- | :--- | :---: |:--- |
|url|string|`'/'`|The base URL of the API you are creating a client for. The base URL should be the path to the root of the API, not the path to any particular endpoint... we'll get to that [later](resources.md).|
|options|object|`{}`|See below.|

If you invoke `createClient(options)` without a url, the url will default to `'/'`

### Available Options

|option|type(s)|default|description|
| :--- |:--- | :---: | :--- |
|agent |axios or any axios-like object|[axios](https://github.com/mzabriskie/axios)|the http agent used to submit AJAX requests|
|before|function|<code>config&nbsp;=>&nbsp;config</code>|A function that receives the [request config](https://github.com/mzabriskie/axios#request-config) and returns the updated config **before** sending the request. Can be used to set-up authentication, headers, or other configuration steps.|

All other options will be merged into your axios [request config](https://github.com/mzabriskie/axios#request-config).

## Examples

Both of these examples are identical:

```js
import { createClient } from 'redux-supermodel'

const client = createClient('https://example.com/api/v1', { auth: { username: 'u', password: 'p' } })
```

```js
import { createClient } from 'redux-supermodel'

function basicAuthentication(config) {
  return { ...config, auth: { username: 'u', password: 'p' } }
}

const client = createClient('https://example.com/api/v1', { before: basicAuthentication })
```

Next, we'll look at how to use your `client` to create [resources](resources.md).

# RingCentral WSG JavaScript SDK

[![npm version](https://badge.fury.io/js/ringcentral-wsg.svg)](https://badge.fury.io/js/ringcentral-wsg)

RingCentral WSG is short for RingCentral WebSocket API Gateway.

> WSG provides a way to request any RingCentral API method with the way similar to HTTP but using WebSocket as a transport.  
> WSG lets you execute all requests asynchronously and receive all RingCentral notifications as messages over WebSocket channel.

An very useful feature for WSG is you can receive notifications from RingCentral server via WebSocket instead of WebHook or PubNub.


## Installation

### Node.js

```
yarn add ringcentral-wsg
```


### or CDN

```html
<script src="https://unpkg.com/axios@0.18.0/dist/axios.min.js"></script>
<script src="https://unpkg.com/ringcentral-wsg@0.1.0/dist/ringcentral.js"></script>
```

`ringcentral-wsg` depends on `ringcentral-js-concise` which depends on `axios`. With the code above you will have a global variable named `RingCentral.default`.


## Basic usage

The usage is almost the same as you use RingCentral Restful API. The API interface mocks the famous HTTP client library [axios](https://github.com/axios/axios).


```js
const rc = new RingCentral(
  process.env.RINGCENTRAL_CLIENT_ID,
  process.env.RINGCENTRAL_CLIENT_SECRET,
  process.env.RINGCENTRAL_SERVER_URL,
  process.env.RINGCENTRAL_WSG_URL
)

await rc.authorize({
  username: process.env.RINGCENTRAL_USERNAME,
  extension: process.env.RINGCENTRAL_EXTENSION,
  password: process.env.RINGCENTRAL_PASSWORD
})

const r = await rc.get('/restapi/v1.0/account/~/extension/~')
console.log(r.data)
console.log(r.headers)

await rc.revoke()
```


## Send SMS

```js
await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
  to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
  from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
  text: 'Hello world'
})
```


## Subscription

```js
rc.subscribe(['/restapi/v1.0/account/~/extension/~/message-store'], data => {
  console.log(data)
})
```


## Access underlying WebSocket object

Normally you don't need to access the WebSocket object, because this library provides you with easier to use API interfaces.

But in case you do have the needs, WebSocket object is available as `rc.ws`. For example:

```js
rc.ws.on('message', data => {
  console.log('WebSocket message', data)
})
```


## About authorization

Currently authorization is still done via Restful API.
Because the WSG project hasn't decided whether to move authorization to WebSocket yet.
This behavior might change in the future.

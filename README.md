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

`ringcentral-wsg` depends on `ringcentral-js-concise` which depends on `axios`. With the code above you will have a global variable named `RingCentral`.


## Usage

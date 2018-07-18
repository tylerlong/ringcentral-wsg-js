import RingCentralRest from 'ringcentral-js-concise'
import WS from 'ws'
import uuid from 'uuid/v1'
import delay from 'timeout-as-promise'

class RingCentral extends RingCentralRest {
  constructor (clientId, clientSecret, httpsServer, wssServer) {
    super(clientId, clientSecret, httpsServer)
    this.ws = new WS(wssServer)
    for (const event of ['close', 'error', 'message', 'open', 'ping', 'pong', 'unexpected-response', 'upgrade']) {
      this.ws.on(event, (...args) => this.emit(event, ...args))
    }
    this.opened = false
    const openHandler = () => {
      this.opened = true
      this.ws.off('open', openHandler)
    }
    this.ws.on('open', openHandler)
  }

  async request (config) {
    while (!this.opened) {
      await delay(1000)
    }
    return new Promise((resolve, reject) => {
      const uid = uuid()
      this.ws.send(JSON.stringify(
        [
          {
            'type': 'ClientRequest',
            'messageId': uid,
            'method': config.method,
            'path': config.url,
            'headers': this._patchHeaders(config.headers)
          }
        ]
      ))
      const handler = data => {
        const [meta, body] = JSON.parse(data)
        if (meta.messageId === uid && meta.type === 'ClientRequest') {
          this.ws.off('message', handler)
          if (meta.status > 199 && meta.status < 300) {
            resolve({
              data: body,
              status: meta.status,
              headers: meta.headers,
              config
            })
          } else {
            reject(new WSGError({
              data: body,
              status: meta.status,
              headers: meta.headers,
              config
            }))
          }
        }
      }
      this.ws.on('message', handler)
    })
  }
}

class WSGError extends Error {
  constructor (response) {
    super()
    this.response = response
  }
}

RingCentral.SANDBOX_HTTPS_SERVER = RingCentral.SANDBOX_SERVER
RingCentral.PRODUCTION_HTTPS_SERVER = RingCentral.PRODUCTION_SERVER
delete RingCentral.SANDBOX_SERVER
delete RingCentral.PRODUCTION_SERVER
RingCentral.SANDBOX_WSS_SERVER = 'wss://ws-api.devtest.ringcentral.com/ws'
RingCentral.PRODUCTION_WSS_SERVER = 'wss://ws-api.ringcentral.com/ws'

export default RingCentral

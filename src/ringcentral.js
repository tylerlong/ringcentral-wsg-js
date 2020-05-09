import RingCentralRest from 'ringcentral-js-concise'
import WS from 'ws'
import { v1 as uuid } from 'uuid'
import delay from 'timeout-as-promise'

import WSGError from './wsg-error'

class RingCentral extends RingCentralRest {
  constructor (clientId, clientSecret, httpsServer, wssServer) {
    super(clientId, clientSecret, httpsServer)
    this.ws = new WS(wssServer)
    this.opened = false
    const openHandler = () => {
      this.opened = true
      this.ws.removeEventListener('open', openHandler)
    }
    this.ws.addEventListener('open', openHandler)
  }

  async revoke () {
    await super.revoke()
    this.ws.close()
  }

  async subscribe (eventFilters, callback) {
    const r = await this.post('/restapi/v1.0/subscription', {
      eventFilters,
      deliveryMode: {
        transportType: 'WebSocket'
      }
    })
    const subscriptionId = r.data.id
    this.ws.addEventListener('message', event => {
      const [meta, body] = JSON.parse(event.data)
      if (meta.type === 'ServerNotification' && body.subscriptionId === subscriptionId) {
        callback(body)
      }
    })
  }

  async request (config) {
    while (!this.opened) {
      await delay(1000)
    }
    return new Promise((resolve, reject) => {
      const uid = uuid()
      const body = [
        {
          type: 'ClientRequest',
          messageId: uid,
          method: config.method,
          path: config.url,
          headers: this._patchHeaders(config.headers)
        }
      ]
      if (config.data) {
        body.push(config.data)
      }
      this.ws.send(JSON.stringify(body))
      const handler = event => {
        const [meta, body] = JSON.parse(event.data)
        if (meta.messageId === uid && meta.type === 'ClientRequest') {
          this.ws.removeEventListener('message', handler)
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
      this.ws.addEventListener('message', handler)
    })
  }
}

RingCentral.SANDBOX_HTTPS_SERVER = RingCentral.SANDBOX_SERVER
RingCentral.PRODUCTION_HTTPS_SERVER = RingCentral.PRODUCTION_SERVER
delete RingCentral.SANDBOX_SERVER
delete RingCentral.PRODUCTION_SERVER
RingCentral.SANDBOX_WSS_SERVER = 'wss://ws-api.devtest.ringcentral.com/ws'
RingCentral.PRODUCTION_WSS_SERVER = 'wss://ws-api.ringcentral.com/ws'

export default RingCentral

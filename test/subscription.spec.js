/* eslint-env jest */
import dotenv from 'dotenv'
import delay from 'timeout-as-promise'

import RingCentral from '../src/ringcentral'

dotenv.config()

jest.setTimeout(128000)

const rc = new RingCentral(
  process.env.RINGCENTRAL_CLIENT_ID,
  process.env.RINGCENTRAL_CLIENT_SECRET,
  process.env.RINGCENTRAL_SERVER_URL,
  process.env.RINGCENTRAL_WSG_URL
)

test('subscription', async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })

  // setup subscription
  let count = 0
  rc.subscribe(['/restapi/v1.0/account/~/extension/~/message-store'], data => {
    // console.log(data)
    count += 1
  })

  // send SMS
  await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
    to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
    from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
    text: 'Hello world'
  })

  await delay(15000) // wait for the notification

  expect(count).toBeGreaterThanOrEqual(1)

  await rc.revoke()
})

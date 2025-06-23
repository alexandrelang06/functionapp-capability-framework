process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import fetch from 'node-fetch'

export default async function (context, req) {
  const rest = context.bindingData.rest || ''
  const target = `https://4.231.232.226:8443/rest/${rest}`
  const resp = await fetch(target, {
    method: req.method,
    headers: {
      ...req.headers,
      host: '4.231.232.226:8443'
    },
    body: ['GET','HEAD','OPTIONS'].includes(req.method)
      ? undefined
      : req.rawBody
  })
  const buffer = await resp.buffer()
  context.res = {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: buffer
  }
}

module.exports = async function (context, req) {
  // ignorer le TLS auto-signé
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const path  = context.bindingData.path || ''
  const query = req.originalUrl.includes('?')
    ? '?' + req.originalUrl.split('?')[1]
    : ''
  const url   = `https://4.231.232.226:8443/auth/${path}${query}`

  // corps JSON
  const body = ['GET','HEAD','OPTIONS'].includes(req.method)
    ? undefined
    : JSON.stringify(req.body)

  // on force le header apikey + content-type + content-length
  const headers = {
    'apikey': req.headers['apikey'] || req.headers['apiKey'] || '<TON_ANON_KEY>',
    'content-type': 'application/json',
    'content-length': body ? Buffer.byteLength(body) : 0
  }

  const resp = await fetch(url, {
    method: req.method,
    headers,
    body
  })

  const buffer = await resp.arrayBuffer()
  context.res = {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: Buffer.from(buffer)
  }
}

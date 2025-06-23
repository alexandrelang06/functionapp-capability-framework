module.exports = async function (context, req) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const path = context.bindingData.path || ''
  const query = req.originalUrl.includes('?')
    ? '?' + req.originalUrl.split('?')[1]
    : ''
  const url = `https://4.231.232.226:8443/rest/${path}${query}`

  const resp = await fetch(url, {
    method: req.method,
    headers: {
      ...req.headers,
      'content-type': 'application/json'
    }
  })

  const buffer = await resp.arrayBuffer()
  context.res = {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: Buffer.from(buffer)
  }
}

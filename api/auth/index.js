module.exports = async function (context, req) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const path = context.bindingData.path || ''
  const url = `https://4.231.232.226:8443/auth/${path}` +
    (req.originalUrl.includes('?')
      ? '?' + req.originalUrl.split('?')[1]
      : '')

  const resp = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body:
      ['GET', 'HEAD', 'OPTIONS'].includes(req.method) || !req.rawBody
        ? undefined
        : req.rawBody
  })

  const buffer = await resp.arrayBuffer()
  context.res = {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: Buffer.from(buffer)
  }
}

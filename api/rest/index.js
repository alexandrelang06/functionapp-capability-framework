import fetch from "node-fetch"

export default async function (context, req) {
  const rest = context.bindingData.rest || ""
  const qs    = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : ""
  const targetUrl = `https://4.231.232.226:8443/rest/${rest}${qs}`
  const headers = { ...req.headers }
  delete headers.host

  const resp = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET","OPTIONS"].includes(req.method) ? undefined : req.rawBody
  })

  context.res = {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: await resp.buffer()
  }
}

import fetch from 'node-fetch';

export default async function(context, req) {
  // ignorer le TLS auto-signé
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const path = context.bindingData.path || '';
  const query = req.originalUrl.split('?')[1] || '';
  const url = `https://4.231.232.226:8443/rest/${path}${query ? '?' + query : ''}`;

  const resp = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : req.rawBody
  });

  context.res = {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: await resp.buffer()
  };
}

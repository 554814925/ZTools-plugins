import type { RequestState } from '../store/request'

function buildCurl(req: RequestState): string {
  let cmd = `curl -X ${req.method} '${req.url}'`

  if (req.params.length > 0) {
    const query = req.params
      .filter((p) => p.enabled && p.key)
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&')
    if (query) cmd += `?${query}`
  }

  if (req.auth.type === 'bearer' && req.auth.token) {
    cmd += ` \\\n  -H 'Authorization: Bearer ${req.auth.token}'`
  } else if (req.auth.type === 'basic' && req.auth.username) {
    cmd += ` \\\n  -u '${req.auth.username}:${req.auth.password}'`
  } else if (req.auth.type === 'apikey') {
    if (req.auth.apiKeyLocation === 'header') {
      cmd += ` \\\n  -H '${req.auth.apiKeyHeader || 'X-API-Key'}: ${req.auth.apiKey}'`
    } else {
      const sep = req.url.includes('?') ? '&' : '?'
      cmd += `${sep}${req.auth.apiKeyHeader || 'api_key'}=${req.auth.apiKey}`
    }
  }

  req.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      cmd += ` \\\n  -H '${h.key}: ${h.value}'`
    })

  if (req.body.type === 'json' && req.body.raw) {
    cmd += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${req.body.raw}'`
  } else if (req.body.type === 'raw' && req.body.raw) {
    cmd += ` \\\n  -d '${req.body.raw}'`
  } else if (req.body.type === 'formdata' && req.body.formData) {
    req.body.formData
      .filter((f) => f.enabled && f.key)
      .forEach((f) => {
        cmd += ` \\\n  -F '${f.key}=${f.value}'`
      })
  } else if (req.body.type === 'urlencoded' && req.body.formData) {
    const data = req.body.formData
      .filter((f) => f.enabled && f.key)
      .map((f) => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
      .join('&')
    cmd += ` \\\n  -d '${data}'`
  }

  return cmd
}

function buildFetch(req: RequestState): string {
  const options: Record<string, unknown> = {
    method: req.method
  }

  const headers: Record<string, string> = {}

  if (req.auth.type === 'bearer' && req.auth.token) {
    headers['Authorization'] = `Bearer ${req.auth.token}`
  } else if (req.auth.type === 'basic' && req.auth.username) {
    const encoded = btoa(`${req.auth.username}:${req.auth.password}`)
    headers['Authorization'] = `Basic ${encoded}`
  } else if (req.auth.type === 'apikey' && req.auth.apiKeyLocation === 'header') {
    headers[req.auth.apiKeyHeader || 'X-API-Key'] = req.auth.apiKey
  }

  req.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headers[h.key] = h.value
    })

  if (Object.keys(headers).length > 0) {
    options.headers = headers
  }

  if (req.body.type === 'json' && req.body.raw) {
    headers['Content-Type'] = 'application/json'
    options.body = req.body.raw
  } else if (req.body.type === 'raw' && req.body.raw) {
    options.body = req.body.raw
  } else if (req.body.type === 'urlencoded' && req.body.formData) {
    const data = req.body.formData
      .filter((f) => f.enabled && f.key)
      .map((f) => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
      .join('&')
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.body = data
  }

  let url = req.url
  if (req.params.length > 0) {
    const query = req.params
      .filter((p) => p.enabled && p.key)
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&')
    if (query) url += (url.includes('?') ? '&' : '?') + query
  }

  if (req.auth.type === 'apikey' && req.auth.apiKeyLocation === 'query' && req.auth.apiKey) {
    const sep = url.includes('?') ? '&' : '?'
    url += `${sep}${req.auth.apiKeyHeader || 'api_key'}=${req.auth.apiKey}`
  }

  const optionsStr = JSON.stringify(options, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")

  return `fetch('${url}', ${optionsStr})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`
}

function buildPython(req: RequestState): string {
  let code = "import requests\n\n"

  let url = req.url
  if (req.params.length > 0) {
    const params = req.params
      .filter((p) => p.enabled && p.key)
      .reduce((acc: Record<string, string>, p) => {
        acc[p.key] = p.value
        return acc
      }, {} as Record<string, string>)
    code += `url = "${url}"\nparams = ${JSON.stringify(params, null, 2).replace(/"/g, "'")}\n\n`
  } else {
    code += `url = "${url}"\n\n`
  }

  const headers: Record<string, string> = {}
  if (req.auth.type === 'bearer' && req.auth.token) {
    headers['Authorization'] = `Bearer ${req.auth.token}`
  } else if (req.auth.type === 'basic' && req.auth.username) {
    headers['Authorization'] = `Basic ${btoa(`${req.auth.username}:${req.auth.password}`)}`
  } else if (req.auth.type === 'apikey' && req.auth.apiKeyLocation === 'header') {
    headers[req.auth.apiKeyHeader || 'X-API-Key'] = req.auth.apiKey
  }

  req.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headers[h.key] = h.value
    })

  if (req.body.type === 'json' && req.body.raw) {
    headers['Content-Type'] = 'application/json'
  }

  if (Object.keys(headers).length > 0) {
    code += `headers = ${JSON.stringify(headers, null, 2).replace(/"/g, "'")}\n\n`
  }

  const args: string[] = ['url']
  if (Object.keys(headers).length > 0) args.push('headers=headers')
  if (req.params.length > 0) args.push('params=params')

  if (req.body.type === 'json' && req.body.raw) {
    code += `data = ${req.body.raw}\n\n`
    args.push('json=data')
  } else if (req.body.type === 'raw' && req.body.raw) {
    code += `data = '''${req.body.raw}'''\n\n`
    args.push('data=data')
  }

  const method = req.method.toLowerCase()
  code += `response = requests.${method}(${args.join(', ')})\n`
  code += `print(response.status_code)\n`
  code += `print(response.json())`

  return code
}

export type CodeLanguage = 'curl' | 'javascript' | 'python'

export function generateCode(req: RequestState, language: CodeLanguage): string {
  switch (language) {
    case 'curl':
      return buildCurl(req)
    case 'javascript':
      return buildFetch(req)
    case 'python':
      return buildPython(req)
    default:
      return ''
  }
}

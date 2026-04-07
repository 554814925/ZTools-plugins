import type { RequestState } from '../store/request'
import { resolveVariables } from './variableResolver'

export interface SendResult {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
  error: string | null
}

function buildUrl(req: RequestState, variables: Record<string, string>): string {
  let url = resolveVariables(req.url, variables)

  const enabledParams = req.params.filter((p) => p.enabled && p.key)
  if (enabledParams.length > 0) {
    const query = enabledParams
      .map((p) => `${encodeURIComponent(resolveVariables(p.key, variables))}=${encodeURIComponent(resolveVariables(p.value, variables))}`)
      .join('&')
    url += (url.includes('?') ? '&' : '?') + query
  }

  if (req.auth.type === 'apikey' && req.auth.apiKeyLocation === 'query' && req.auth.apiKey) {
    const sep = url.includes('?') ? '&' : '?'
    url += `${sep}${req.auth.apiKeyHeader || 'api_key'}=${resolveVariables(req.auth.apiKey, variables)}`
  }

  return url
}

function buildHeaders(req: RequestState, variables: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {}

  if (req.auth.type === 'bearer' && req.auth.token) {
    headers['Authorization'] = `Bearer ${resolveVariables(req.auth.token, variables)}`
  } else if (req.auth.type === 'basic' && req.auth.username) {
    const encoded = btoa(
      `${resolveVariables(req.auth.username, variables)}:${resolveVariables(req.auth.password, variables)}`
    )
    headers['Authorization'] = `Basic ${encoded}`
  } else if (req.auth.type === 'apikey' && req.auth.apiKeyLocation === 'header') {
    headers[req.auth.apiKeyHeader || 'X-API-Key'] = resolveVariables(req.auth.apiKey, variables)
  }

  req.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headers[resolveVariables(h.key, variables)] = resolveVariables(h.value, variables)
    })

  return headers
}

function buildBody(req: RequestState, variables: Record<string, string>): BodyInit | undefined {
  if (req.body.type === 'none') return undefined

  if (req.body.type === 'json' && req.body.raw) {
    if (!req.headers.some((h) => h.key.toLowerCase() === 'content-type')) {
      // Will be set in fetch call
    }
    return resolveVariables(req.body.raw, variables)
  }

  if (req.body.type === 'raw' && req.body.raw) {
    return resolveVariables(req.body.raw, variables)
  }

  if (req.body.type === 'urlencoded' && req.body.formData) {
    const params = new URLSearchParams()
    req.body.formData
      .filter((f) => f.enabled && f.key)
      .forEach((f) => {
        params.append(
          resolveVariables(f.key, variables),
          resolveVariables(f.value, variables)
        )
      })
    return params
  }

  return undefined
}

export async function sendRequest(
  req: RequestState,
  variables: Record<string, string>
): Promise<SendResult> {
  const startTime = performance.now()
  const url = buildUrl(req, variables)
  const headers = buildHeaders(req, variables)
  const body = buildBody(req, variables)

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    body
  }

  try {
    const response = await fetch(url, fetchOptions)
    const endTime = performance.now()

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    const responseText = await response.text()
    const size = new Blob([responseText]).size

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseText,
      time: Math.round(endTime - startTime),
      size,
      error: null
    }
  } catch (error: unknown) {
    const endTime = performance.now()
    return {
      status: 0,
      statusText: '',
      headers: {},
      body: '',
      time: Math.round(endTime - startTime),
      size: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeHtmlEntities(str: string): string {
  let output = str
  for (let i = 0; i < 3; i += 1) {
    const next = output
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    if (next === output) break
    output = next
  }
  return output
}

function normalizeMarkupBody(body: string): string {
  const trimmed = body.trim()
  const hasEscapedTags = /&lt;\/?[\w!]/.test(trimmed)
  const hasRawTags = /<\/?[\w!]/.test(trimmed)
  if (hasEscapedTags && !hasRawTags) {
    return decodeHtmlEntities(body)
  }
  return body
}

function c(str: string, color: string): string {
  return `<span style="color:${color}">${escapeHtml(str)}</span>`
}

function cEscaped(str: string, color: string): string {
  return `<span style="color:${color}">${str}</span>`
}

function highlightJson(json: string): string {
  return json.replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],]/g,
    (m, str, colon) => {
      if (str) {
        if (colon) {
          return c(str, 'var(--accent-primary)') + c(colon, 'var(--text-muted)')
        }
        return c(str, 'var(--success-color)')
      }
      if (/true|false/.test(m)) return c(m, '#a78bfa')
      if (/null/.test(m)) return c(m, '#f472b6')
      if (/[{}\[\],]/.test(m)) return c(m, 'var(--text-muted)')
      return c(m, 'var(--warning-color)')
    }
  )
}

function highlightHtml(html: string): string {
  const e = escapeHtml(html)
  return e.replace(
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([\w!][\w\-]*)((?:\s+[\w\-]+(?:\s*=\s*(?:&quot;[^&]*?&quot;|[^\s&]+))?)*)\s*(\/?&gt;)/g,
    (_m, comment, open, tag, attrs, close) => {
      if (comment) return cEscaped(comment, 'var(--text-muted)')
      let r = cEscaped(open, 'var(--text-muted)')
      r += cEscaped(tag, 'var(--accent-primary)')
      if (attrs) {
        r += attrs.replace(
          /(\s+)([\w\-]+)(\s*=\s*)?(&quot;[^&]*?&quot;|[^\s&]+)?/g,
          (_a, space, name, eq, val) => {
            let s = space + cEscaped(name, 'var(--warning-color)')
            if (eq) s += cEscaped(eq, 'var(--text-muted)')
            if (val) s += cEscaped(val, 'var(--success-color)')
            return s
          }
        )
      }
      r += cEscaped(close, 'var(--text-muted)')
      return r
    }
  )
}

function detectLang(body: string, contentType?: string): 'json' | 'html' | 'xml' | 'text' {
  if (contentType) {
    const ct = contentType.toLowerCase()
    if (ct.includes('json')) return 'json'
    if (ct.includes('html')) return 'html'
    if (ct.includes('xml')) return 'xml'
  }
  const t = body.trim()
  if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
    try { JSON.parse(t); return 'json' } catch { /* not json */ }
  }
  if (t.startsWith('<') && /<\/?[\w!]/.test(t)) return 'html'
  if (t.startsWith('&lt;') && /&lt;\/?[\w!]/.test(t)) return 'html'
  return 'text'
}

export function highlight(body: string, contentType?: string): string {
  if (!body) return ''
  const lang = detectLang(body, contentType)
  switch (lang) {
    case 'json': return highlightJson(body)
    case 'html':
    case 'xml': return highlightHtml(normalizeMarkupBody(body))
    default: return escapeHtml(body)
  }
}

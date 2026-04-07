import { reactive } from 'vue'

export interface RequestState {
  method: string
  url: string
  params: Array<{ key: string; value: string; enabled: boolean }>
  headers: Array<{ key: string; value: string; enabled: boolean }>
  auth: {
    type: 'none' | 'bearer' | 'basic' | 'apikey'
    token: string
    username: string
    password: string
    apiKey: string
    apiKeyLocation: 'header' | 'query'
    apiKeyHeader: string
  }
  body: {
    type: 'none' | 'json' | 'formdata' | 'urlencoded' | 'raw'
    raw: string
    formData: Array<{ key: string; value: string; enabled: boolean; isFile: boolean }>
  }
}

export interface ResponseState {
  status: number | null
  statusText: string
  time: number | null
  size: number | null
  headers: Record<string, string>
  body: string
  raw: string
  error: string | null
}

const defaultRequest: RequestState = {
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  auth: {
    type: 'none',
    token: '',
    username: '',
    password: '',
    apiKey: '',
    apiKeyLocation: 'header',
    apiKeyHeader: 'X-API-Key'
  },
  body: {
    type: 'none',
    raw: '',
    formData: []
  }
}

const defaultResponse: ResponseState = {
  status: null,
  statusText: '',
  time: null,
  size: null,
  headers: {},
  body: '',
  raw: '',
  error: null
}

const request = reactive<RequestState>({ ...defaultRequest })
const response = reactive<ResponseState>({ ...defaultResponse })

export function useRequestStore() {
  function setRequest(data: Partial<RequestState>) {
    Object.assign(request, data)
  }

  function loadRequest(data: RequestState) {
    Object.assign(request, JSON.parse(JSON.stringify(data)))
  }

  function resetRequest() {
    Object.assign(request, JSON.parse(JSON.stringify(defaultRequest)))
  }

  function setResponse(data: Partial<ResponseState>) {
    Object.assign(response, data)
  }

  function resetResponse() {
    Object.assign(response, JSON.parse(JSON.stringify(defaultResponse)))
  }

  function getRequestSnapshot(): RequestState {
    return JSON.parse(JSON.stringify(request))
  }

  return {
    request,
    response,
    setRequest,
    loadRequest,
    resetRequest,
    setResponse,
    resetResponse,
    getRequestSnapshot
  }
}

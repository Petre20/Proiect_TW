import { AxiosError, AxiosHeaders } from 'axios'
import { ApiError, toApiError } from './http'

function axiosError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status, statusText: '', data, headers: {}, config,
  })
}

describe('toApiError', () => {
  it('keeps the backend message', () => {
    const e = toApiError(axiosError(400, { detail: 'Email sau parola incorecta.' }))
    expect(e).toBeInstanceOf(ApiError)
    expect(e.status).toBe(400)
    expect(e.message).toBe('Email sau parola incorecta.')
  })

  it('maps 422 validation issues to fields', () => {
    const e = toApiError(
      axiosError(422, { detail: [{ type: 'string_too_short', loc: ['body', 'password'], msg: 'Too short' }] }),
    )
    expect(e.fieldErrors).toEqual({ password: 'Too short' })
  })

  it('reports a network failure', () => {
    const e = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'))
    expect(e.status).toBe(0)
  })
})

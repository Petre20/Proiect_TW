import { http, HttpResponse } from 'msw'
import { authApi } from '@/features/auth/api'
import { server } from './server'

describe('msw test server', () => {
  it('answers relative /api requests made through the axios client', async () => {
    server.use(http.get('*/api/auth/me', () => HttpResponse.json({ id: 1, name: 'Ana' })))
    await expect(authApi.me()).resolves.toMatchObject({ id: 1 })
  })

  it('fails the request when no handler matches', async () => {
    await expect(authApi.me()).rejects.toBeDefined()
  })
})

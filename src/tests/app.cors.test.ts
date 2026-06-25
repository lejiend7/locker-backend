import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app.ts';

describe('app CORS handling', () => {
  it('responds to preflight OPTIONS requests for API routes', async () => {
    const app = createApp();
    const origin = process.env.CORS_ORIGIN || '';

    const res = await request(app)
      .options('/api/lockers')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type, authorization');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });
});

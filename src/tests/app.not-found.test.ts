import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app.ts';

describe('app 404 response standardization', () => {
  it('returns the shared API envelope for unknown routes', async () => {
    const app = createApp();

    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      statusCode: 404,
      message: 'Route not found',
      data: [],
      errors: ['Route not found'],
    });
  });
});

import { describe, expect, it } from 'vitest';
import { buildApiResponse } from '@/utils/response.ts';

describe('buildApiResponse', () => {
  it('preserves object data and returns empty errors when none are provided', () => {
    const response = buildApiResponse({
      success: true,
      statusCode: 200,
      message: 'Stations fetched successfully',
      data: { id: 1, name: 'The Curve' },
    });

    expect(response).toEqual({
      success: true,
      statusCode: 200,
      message: 'Stations fetched successfully',
      data: { id: 1, name: 'The Curve' },
      errors: [],
    });
  });

  it('normalizes errors into an array', () => {
    const response = buildApiResponse({
      success: false,
      statusCode: 403,
      message: 'Admin access required',
      errors: 'Admin access required',
    });

    expect(response.errors).toEqual(['Admin access required']);
    expect(response.data).toEqual([]);
  });

  it('converts database-style keys to camelCase throughout response data', () => {
    const response = buildApiResponse({
      success: true,
      statusCode: 200,
      message: 'Package fetched successfully',
      data: [{ package_size: 'medium', locker: { station_id: 3 } }],
    });

    expect(response.data).toEqual([{ packageSize: 'medium', locker: { stationId: 3 } }]);
  });
});

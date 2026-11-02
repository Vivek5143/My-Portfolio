import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

import { SupabaseProjectStore } from '../server/db';

function createServiceRoleJwt(): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role: 'service_role' })}.signature`;
}

describe('Supabase server client', () => {
  beforeEach(() => {
    createClient.mockClear();
  });

  it('pins the service credential to the Authorization header without session persistence', () => {
    const key = createServiceRoleJwt();
    new SupabaseProjectStore('https://example.supabase.co', key);

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      key,
      expect.objectContaining({
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${key}`,
          },
        },
      }),
    );
  });
});

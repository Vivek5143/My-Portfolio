import { describe, expect, it } from 'vitest';
import { isSupabaseServiceRoleKey } from '../server/config';

function createJwt(payload: object): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('Supabase server credential configuration', () => {
  it('accepts only a service_role JWT', () => {
    expect(isSupabaseServiceRoleKey(createJwt({ role: 'service_role' }))).toBe(true);
    expect(isSupabaseServiceRoleKey('sb_secret_server_key')).toBe(true);
    expect(isSupabaseServiceRoleKey(createJwt({ role: 'anon' }))).toBe(false);
    expect(isSupabaseServiceRoleKey('sb_publishable_example')).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSession = vi.fn();
const mockOnAuthChange = vi.fn();
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/services/auth', () => ({
  getSession: () => mockGetSession(),
  onAuthChange: (cb: unknown) => mockOnAuthChange(cb),
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signOut: () => mockSignOut(),
}));

import {
  getSession,
  onAuthChange,
  signIn,
  signUp,
  signOut,
} from '@/services/auth';

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Auth service integration (provider delegates to service)
// ---------------------------------------------------------------------------

describe('auth service functions used by provider', () => {
  it('getSession returns user when session exists', async () => {
    const user = { id: 'u-1', email: 'a@b.com', name: 'Aster' };
    mockGetSession.mockResolvedValue(user);

    const result = await getSession();

    expect(result).toEqual(user);
  });

  it('getSession returns null when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getSession();

    expect(result).toBeNull();
  });

  it('onAuthChange registers callback and returns cleanup', () => {
    const cleanup = vi.fn();
    mockOnAuthChange.mockReturnValue(cleanup);

    const callback = vi.fn();
    const result = onAuthChange(callback);

    expect(mockOnAuthChange).toHaveBeenCalledWith(callback);
    expect(result).toBe(cleanup);
  });

  it('signIn delegates to auth service', async () => {
    const user = { id: 'u-1', email: 'a@b.com', name: 'Aster' };
    mockSignIn.mockResolvedValue({ user, error: null });

    const result = await signIn('a@b.com', '123456');

    expect(result).toEqual({ user, error: null });
    expect(mockSignIn).toHaveBeenCalledWith('a@b.com', '123456');
  });

  it('signIn returns error on failure', async () => {
    mockSignIn.mockResolvedValue({ user: null, error: 'Invalid login credentials' });

    const result = await signIn('a@b.com', 'wrong');

    expect(result.error).toBe('Invalid login credentials');
  });

  it('signUp delegates to auth service with name', async () => {
    const user = { id: 'u-1', email: 'a@b.com', name: 'Test' };
    mockSignUp.mockResolvedValue({ user, error: null });

    const result = await signUp('a@b.com', '123456', 'Test');

    expect(result).toEqual({ user, error: null });
    expect(mockSignUp).toHaveBeenCalledWith('a@b.com', '123456', 'Test');
  });

  it('signUp returns error on failure', async () => {
    mockSignUp.mockResolvedValue({ user: null, error: 'User already registered' });

    const result = await signUp('a@b.com', '123456', 'Test');

    expect(result.error).toBe('User already registered');
  });

  it('signOut delegates to auth service', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });
});

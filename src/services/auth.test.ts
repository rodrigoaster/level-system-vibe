import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  },
}));

import { signUp, signIn, signOut, getSession, onAuthChange } from './auth';

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------

describe('signUp', () => {
  it('returns user on success', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'a@b.com', user_metadata: { name: 'Aster' } } },
      error: null,
    });

    const result = await signUp('a@b.com', '123456', 'Aster');

    expect(result.user).toEqual({ id: 'u-1', email: 'a@b.com', name: 'Aster' });
    expect(result.error).toBeNull();
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: '123456',
      options: { data: { name: 'Aster' } },
    });
  });

  it('returns error on duplicate email', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const result = await signUp('a@b.com', '123456', 'Aster');

    expect(result.user).toBeNull();
    expect(result.error).toBe('User already registered');
  });

  it('returns error on weak password', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Password should be at least 6 characters' },
    });

    const result = await signUp('a@b.com', '12', 'Aster');

    expect(result.user).toBeNull();
    expect(result.error).toBe('Password should be at least 6 characters');
  });

  it('returns error when user is null without error', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await signUp('a@b.com', '123456', 'Aster');

    expect(result.user).toBeNull();
    expect(result.error).toBe('Erro ao criar conta');
  });
});

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------

describe('signIn', () => {
  it('returns user on success', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'a@b.com', user_metadata: { name: 'Aster' } } },
      error: null,
    });

    const result = await signIn('a@b.com', '123456');

    expect(result.user).toEqual({ id: 'u-1', email: 'a@b.com', name: 'Aster' });
    expect(result.error).toBeNull();
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: '123456',
    });
  });

  it('returns error on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const result = await signIn('a@b.com', 'wrong');

    expect(result.user).toBeNull();
    expect(result.error).toBe('Invalid login credentials');
  });

  it('returns error when user is null without error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await signIn('a@b.com', '123456');

    expect(result.user).toBeNull();
    expect(result.error).toBe('Erro ao fazer login');
  });

  it('extracts name from user_metadata', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'a@b.com', user_metadata: { name: 'Test User' } } },
      error: null,
    });

    const result = await signIn('a@b.com', '123456');

    expect(result.user?.name).toBe('Test User');
  });

  it('defaults name to empty string when metadata is missing', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'a@b.com', user_metadata: {} } },
      error: null,
    });

    const result = await signIn('a@b.com', '123456');

    expect(result.user?.name).toBe('');
  });
});

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

describe('signOut', () => {
  it('resolves on success', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(signOut()).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    const err = { message: 'Sign out failed' };
    mockSignOut.mockResolvedValue({ error: err });

    await expect(signOut()).rejects.toEqual(err);
  });
});

// ---------------------------------------------------------------------------
// getSession
// ---------------------------------------------------------------------------

describe('getSession', () => {
  it('returns user when session exists', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'u-1', email: 'a@b.com', user_metadata: { name: 'Aster' } },
        },
      },
      error: null,
    });

    const result = await getSession();

    expect(result).toEqual({ id: 'u-1', email: 'a@b.com', name: 'Aster' });
  });

  it('returns null when no session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await getSession();

    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Session error' },
    });

    const result = await getSession();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// onAuthChange
// ---------------------------------------------------------------------------

describe('onAuthChange', () => {
  it('calls callback with user on sign in', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const callback = vi.fn();
    onAuthChange(callback);

    // Get the listener that was registered
    const listener = mockOnAuthStateChange.mock.calls[0][0];

    // Simulate sign in event
    listener('SIGNED_IN', {
      user: { id: 'u-1', email: 'a@b.com', user_metadata: { name: 'Aster' } },
    });

    expect(callback).toHaveBeenCalledWith({
      id: 'u-1',
      email: 'a@b.com',
      name: 'Aster',
    });
  });

  it('calls callback with null on sign out', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const callback = vi.fn();
    onAuthChange(callback);

    const listener = mockOnAuthStateChange.mock.calls[0][0];
    listener('SIGNED_OUT', null);

    expect(callback).toHaveBeenCalledWith(null);
  });

  it('returns cleanup function that unsubscribes', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const cleanup = onAuthChange(vi.fn());
    cleanup();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

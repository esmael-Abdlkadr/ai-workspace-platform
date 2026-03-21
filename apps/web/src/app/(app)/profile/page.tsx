'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut, authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';
import {
  Lock,
  LogOut,
  Eye,
  EyeOff,
  User,
  Zap,
  Shield,
  Sparkles,
} from 'lucide-react';

type Tab = 'profile' | 'security';

function PasswordInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="w-full rounded-xl py-2.5 pl-4 pr-10 text-sm outline-none"
          style={{
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');

  const [name, setName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-white/10"
          style={{ borderTopColor: 'var(--accent)' }}
        />
      </div>
    );
  }

  if (!session) { router.push('/login'); return null; }

  const user = session.user;

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty.'); return; }
    setNameLoading(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      toast.success('Name updated.');
    } catch {
      toast.error('Failed to update name.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    setPasswordLoading(true);
    try {
      await authClient.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      toast.error('Incorrect current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top hero banner */}
      <div
        className="relative shrink-0 overflow-hidden px-8 pb-0 pt-10"
        style={{ background: 'linear-gradient(160deg, #0d0d16 0%, #111118 100%)' }}
      >
        {/* Ambient glow blobs */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: '#7c6ff715' }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: '#7c6ff708' }}
        />

        <div className="relative mx-auto max-w-3xl">
          {/* Avatar row */}
          <div className="flex items-end gap-5 pb-6">
            <div className="relative">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full blur-md"
                style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', opacity: 0.5, margin: '-4px' }}
              />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', border: '3px solid #0d0d16' }}
              >
                {user.image
                  ? <img src={user.image} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
                  : initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: 'var(--success)', border: '2px solid #0d0d16' }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h1>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid #7c6ff730' }}
                >
                  <Sparkles size={9} /> Pro
                </span>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>

            {/* Stats chips */}
            <div className="ml-auto flex items-center gap-3 pb-1">
              {[
                { icon: Zap, label: 'Active', value: 'Session' },
                { icon: Shield, label: 'Verified', value: 'Account' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-xl px-4 py-2.5"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <Icon size={14} style={{ color: 'var(--accent)' }} />
                  <span className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {(['profile', 'security'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative px-5 py-3 text-sm font-medium capitalize transition-colors"
                style={{ color: tab === t ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {t}
                {tab === t && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-8 py-8" style={{ background: 'var(--background)' }}>
        <div className="mx-auto max-w-3xl">

          {tab === 'profile' && (
            <div className="grid gap-5 md:grid-cols-2">
              {/* Update name card */}
              <div
                className="rounded-2xl p-6 md:col-span-2"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="mb-5 flex items-center gap-2">
                  <User size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Display Name
                  </span>
                </div>
                <form onSubmit={handleUpdateName} className="flex items-end gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none"
                      style={{
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={nameLoading || name.trim() === user.name}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {nameLoading
                      ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : 'Save'}
                  </button>
                </form>
              </div>

              {/* Email card (read-only) */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Email address</p>
                <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                <span
                  className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}
                >
                  Managed by provider
                </span>
              </div>

              {/* Joined card */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Member since</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <span
                  className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                  style={{ background: 'var(--success-dim)', color: 'var(--success)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                  Active
                </span>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-5">
              {/* Change password */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="mb-5 flex items-center gap-2">
                  <Lock size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Change Password
                  </span>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <PasswordInput label="Current password" value={currentPassword} onChange={setCurrentPassword} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordInput label="New password" value={newPassword} onChange={setNewPassword} placeholder="Min. 8 characters" />
                    <PasswordInput label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat new password" />
                  </div>
                  {/* Password strength bar */}
                  {newPassword && (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Strength</span>
                        <span className="text-[10px] font-medium" style={{
                          color: newPassword.length >= 12 ? 'var(--success)' : newPassword.length >= 8 ? 'var(--warning)' : 'var(--danger)',
                        }}>
                          {newPassword.length >= 12 ? 'Strong' : newPassword.length >= 8 ? 'Fair' : 'Weak'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[8, 10, 12].map((threshold, i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background: newPassword.length >= threshold
                                ? threshold === 12 ? 'var(--success)' : threshold === 10 ? 'var(--warning)' : 'var(--danger)'
                                : 'var(--surface-3)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {passwordLoading
                      ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : 'Update password'}
                  </button>
                </form>
              </div>

              {/* Sign out */}
              <div
                className="flex items-center justify-between rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sign out</p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    End your current session
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signOutLoading}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 hover:opacity-80"
                  style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                >
                  {signOutLoading
                    ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                    : <LogOut size={14} />}
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

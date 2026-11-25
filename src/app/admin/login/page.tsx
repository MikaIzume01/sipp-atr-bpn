'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  ArrowLeft,
  Shield,
  Mail,
  Send,
  Sparkles
} from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const verifiedParam = searchParams.get('verified');
  const userParam = searchParams.get('user');

  const [authType, setAuthType] = useState<'warga' | 'petugas'>('warga');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState(userParam || '');
  const [password, setPassword] = useState('');

  // Register form state (Warga)
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Verification State (after register)
  const [verificationPending, setVerificationPending] = useState<{
    email: string;
    username: string;
    token?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    verifiedParam === 'true' ? 'Akun Anda telah berhasil diverifikasi! Silakan masuk.' : null
  );

  useEffect(() => {
    if (userParam) {
      setUsername(userParam);
    }
  }, [userParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.notVerified) {
          setVerificationPending({
            email: data.email || 'Email terdaftar',
            username: data.username || username,
          });
          throw new Error('Akun Anda belum diverifikasi. Silakan periksa tautan verifikasi pada email Anda.');
        }
        throw new Error(data.message || 'Login gagal. Periksa kembali username dan kata sandi Anda.');
      }

      // Arahkan ke redirect target jika ada (misal kembali ke /formulir)
      if (redirectParam) {
        window.location.href = redirectParam;
        return;
      }

      // Arahkan sesuai peran: Warga ke /warga, Petugas ke /admin
      const destination = data.redirectUrl || (data.user?.role === 'WARGA' ? '/warga' : '/admin');
      window.location.href = destination;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authType === 'warga' && !regEmail) {
      setErrorMessage('Alamat email (Gmail) wajib diisi untuk pengiriman tautan verifikasi akun.');
      setIsLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLengkap: regNama,
          email: regEmail || null,
          nik: regNik || null,
          noWhatsapp: regWhatsapp || null,
          username: regUsername,
          password: regPassword,
          role: authType === 'petugas' ? 'VERIFIKATOR' : 'WARGA',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Pendaftaran gagal.');
      }

      if (data.needVerification) {
        // Tampilkan layar notifikasi verifikasi email
        setVerificationPending({
          email: data.email,
          username: data.username,
          token: data.token,
        });
        setIsLoading(false);
        return;
      }

      // Jika role petugas (langsung aktif)
      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke dashboard...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleSimulateEmailVerification = async () => {
    if (!verificationPending) return;
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationPending.token,
          username: verificationPending.username,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verifikasi gagal.');
      }

      setVerificationSuccess(true);
      setSuccessMessage('Akun Anda telah berhasil diverifikasi! Silakan masuk menggunakan kata sandi Anda.');
      setUsername(verificationPending.username);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat verifikasi.';
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-bpn.png"
            alt="Logo BPN"
            className="w-12 h-12 object-contain mx-auto"
          />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            KILAT BPN
          </h1>
          <p className="text-xs font-semibold text-slate-700">
            Kanal Informasi &amp; Layanan Administrasi Tanah
          </p>
          <p className="text-[11px] text-slate-500">
            Badan Pertanahan Nasional
          </p>
        </div>

        {/* Tab Pemilih Akses: Warga vs Petugas (Hanya bila tidak sedang di layar verifikasi email) */}
        {!verificationPending && (
          <div className="grid grid-cols-2 p-1 bg-slate-200 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthType('warga');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authType === 'warga'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Masyarakat / Warga</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthType('petugas');
                setMode('login'); // Petugas default login
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authType === 'petugas'
                  ? 'bg-white text-[#0b2f57] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Petugas Loket</span>
            </button>
          </div>
        )}

        {/* Card Form */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          {/* LAYAR NOTIFIKASI VERIFIKASI EMAIL GMAIL */}
          {verificationPending ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-blue-50 text-[#0b2f57] rounded-full flex items-center justify-center mx-auto border border-blue-200">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">
                  {verificationSuccess ? 'Akun Berhasil Diverifikasi!' : 'Notifikasi Verifikasi Dikirim ke Gmail'}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {verificationSuccess ? (
                    'Akun Anda sudah aktif. Anda sekarang dapat masuk untuk mengakses layanan dan pengisian formulir online.'
                  ) : (
                    <>
                      Tautan konfirmasi aktivasi akun telah kami kirimkan ke alamat email:
                      <strong className="block text-slate-900 font-bold text-sm my-1">
                        {verificationPending.email}
                      </strong>
                      Silakan periksa kotak masuk (Inbox) atau folder Spam pada akun Gmail Anda.
                    </>
                  )}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                {!verificationSuccess ? (
                  <button
                    type="button"
                    onClick={handleSimulateEmailVerification}
                    disabled={isVerifying}
                    className="w-full py-2.5 px-4 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span>Memverifikasi Tautan...</span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Verifikasi Akun Saya Sekarang</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationPending(null);
                      setMode('login');
                    }}
                    className="w-full py-2.5 px-4 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Lanjut Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setVerificationPending(null);
                    setMode('login');
                  }}
                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sub Switch: Masuk vs Daftar */}
              <div className="flex border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                    mode === 'login'
                      ? 'border-[#0b2f57] text-[#0b2f57]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                    mode === 'register'
                      ? 'border-[#0b2f57] text-[#0b2f57]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Daftar Akun {authType === 'warga' ? 'Warga' : 'Petugas'}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {mode === 'login' ? (
                /* Form Masuk */
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="user-f" className="block font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="user-f"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={authType === 'warga' ? 'Username akun warga Anda' : 'Username akun petugas loket'}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pass-f" className="block font-semibold text-slate-700 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="pass-f"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                  >
                    {isLoading ? (
                      <span>Memverifikasi...</span>
                    ) : (
                      <>
                        <span>Masuk sebagai {authType === 'warga' ? 'Warga' : 'Petugas'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Form Daftar Akun Baru */
                <form onSubmit={handleRegister} className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="reg-name-f" className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-name-f"
                      type="text"
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      placeholder="Contoh: Bambang Sudirman, S.H."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      required
                    />
                  </div>

                  {authType === 'warga' && (
                    <>
                      <div>
                        <label htmlFor="reg-email-f" className="block font-semibold text-slate-700 mb-1">
                          Alamat Email (Gmail) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-email-f"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="contoh: warga@gmail.com"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                          required
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Tautan verifikasi aktivasi akun akan dikirimkan ke email ini
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="reg-nik-f" className="block font-semibold text-slate-700 mb-1">
                            NIK (16 Digit)
                          </label>
                          <input
                            id="reg-nik-f"
                            type="text"
                            maxLength={16}
                            value={regNik}
                            onChange={(e) => setRegNik(e.target.value)}
                            placeholder="3171..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                          />
                        </div>

                        <div>
                          <label htmlFor="reg-wa-f" className="block font-semibold text-slate-700 mb-1">
                            No. WhatsApp <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="reg-wa-f"
                            type="tel"
                            required
                            value={regWhatsapp}
                            onChange={(e) => setRegWhatsapp(e.target.value)}
                            placeholder="0812..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="reg-user-f" className="block font-semibold text-slate-700 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-user-f"
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Pilih username unik Anda"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-pass-f" className="block font-semibold text-slate-700 mb-1">
                      Kata Sandi (Minimal 6 karakter) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-pass-f"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-cpass-f" className="block font-semibold text-slate-700 mb-1">
                      Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-cpass-f"
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs mt-2"
                  >
                    {isLoading ? (
                      <span>Mendaftarkan...</span>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Daftar Akun {authType === 'warga' ? 'Warga' : 'Petugas'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Publik</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-xs text-slate-500">Memuat halaman masuk...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

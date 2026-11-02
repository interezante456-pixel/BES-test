"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { OraconLogo } from '@/components/OraconLogo';
import { APP_CONFIG } from '@/config/version';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Extraer valores desde el formulario DOM (compatible con Katalon Recorder, autofill y extensiones) con fallback al state
    const form = e.currentTarget;
    const emailEl = (form.elements.namedItem('email') as HTMLInputElement | null) || (form.querySelector('input[type="email"]') as HTMLInputElement | null);
    const passwordEl = (form.elements.namedItem('password') as HTMLInputElement | null) || (form.querySelector('input[type="password"], input[name="password"]') as HTMLInputElement | null);

    const submittedEmail = (emailEl?.value || email || '').trim();
    const submittedPassword = passwordEl?.value || password || '';

    if (submittedEmail && submittedEmail !== email) setEmail(submittedEmail);
    if (submittedPassword && submittedPassword !== password) setPassword(submittedPassword);
    
    try {
      // Route Handler de Next.js → llama al backend y setea cookie httpOnly
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail, password: submittedPassword }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setError('Demasiados intentos fallidos. Espera un momento e intenta de nuevo.');
        return;
      }

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join('. ')
          : (data.message || 'Error al iniciar sesión');
        setError(errorMsg);
        return;
      }

      // Guardar token (para el interceptor de Axios) y datos de usuario
      setAuth(data.access_token, data.usuario);
      router.push('/dashboard');
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements in Oracon Orange */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-orange-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-orange-500/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <OraconLogo size="lg" className="mb-4" />
          <p className="text-gray-400 font-medium text-sm">Monitoreo de Buzón Electrónico SUNAT</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInput={(e) => setEmail(e.currentTarget.value)}
                autoComplete="email"
                required
                className="block w-full pl-12 pr-4 py-3.5 bg-[#1f2937]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 outline-none"
                placeholder="admin@oracon.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={(e) => setPassword(e.currentTarget.value)}
                autoComplete="current-password"
                required
                className="block w-full pl-12 pr-12 py-3.5 bg-[#1f2937]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-orange-400 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-to-r from-orange-600 via-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-orange-500/25 transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        {/* Identificador de Versión para Producción */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {APP_CONFIG.name}
          </span>
          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-400 font-semibold tracking-wide">
            {APP_CONFIG.version}
          </span>
        </div>
      </div>
    </div>
  );
}

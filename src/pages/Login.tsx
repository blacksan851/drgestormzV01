import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao iniciar sessão. Verifique as suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;
      setMessage('Conta criada com sucesso! Verifique o seu e-mail para confirmar (se aplicável) ou faça login.');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setMessage('Verifique o seu e-mail para redefinir a sua senha.');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_12px_24px_rgba(0,108,73,0.08)] border border-outline-variant overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary"></div>
        <div className="p-8">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
            <h1 className="font-headline-lg text-headline-md text-primary font-bold">DR Gestor MZ</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              {view === 'login' && 'Bem-vindo de volta! Faça login na sua conta.'}
              {view === 'register' && 'Crie a sua conta para começar.'}
              {view === 'forgot_password' && 'Recupere o acesso à sua conta.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-secondary-container text-on-secondary-container rounded-lg text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={view === 'login' ? handleLogin : view === 'register' ? handleRegister : handleResetPassword} className="space-y-5">
            {view === 'register' && (
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="nome@empresa.com"
              />
            </div>

            {view !== 'forgot_password' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Senha</label>
                  {view === 'login' && (
                    <button type="button" onClick={() => setView('forgot_password')} className="font-label-sm text-sm text-primary hover:underline">
                      Esqueceu-se?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-md py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2 shadow-sm hover-lift"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">
                  {view === 'login' ? 'login' : view === 'register' ? 'person_add' : 'mail'}
                </span>
              )}
              {view === 'login' ? 'Entrar' : view === 'register' ? 'Criar Conta' : 'Enviar Link'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-outline-variant/50 pt-6">
            {view === 'login' ? (
              <p className="text-on-surface-variant text-sm font-body-md">
                Ainda não tem conta?{' '}
                <button onClick={() => { setView('register'); setError(null); setMessage(null); }} className="text-primary font-bold hover:underline">
                  Registe-se agora
                </button>
              </p>
            ) : (
              <p className="text-on-surface-variant text-sm font-body-md">
                Já tem conta?{' '}
                <button onClick={() => { setView('login'); setError(null); setMessage(null); }} className="text-primary font-bold hover:underline">
                  Faça Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

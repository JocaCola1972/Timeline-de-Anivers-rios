
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { Smartphone, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulation logic
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.phone === phone);
      if (user) {
        const isAdmin = phone === '917772010';
        const validPassword = isAdmin ? '123456' : '123';

        if (!useOTP && password === validPassword) {
           // Direct login for demo
           onLogin({ ...user, mustChangePassword: !isAdmin }); // Admin doesn't necessarily need to change
        } else if (useOTP && otpCode === '123456') {
           onLogin(user);
        } else {
           setError(`Credenciais inválidas. Para este telemóvel, usa a password correta.`);
        }
      } else {
        setError('Utilizador não encontrado.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const sendOTP = () => {
    setIsLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo à Timeline</h1>
          <p className="text-slate-500">Faz login para ver os próximos aniversários.</p>
        </div>

        <div className="flex p-1 bg-slate-50 rounded-xl">
          <button
            onClick={() => { setUseOTP(false); setOtpSent(false); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!useOTP ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setUseOTP(true); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${useOTP ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Código SMS
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Telemóvel</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="Ex: 917772010"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          {!useOTP ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>
          ) : otpSent ? (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-sm font-semibold text-slate-700">Código de 6 dígitos</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Ex: 123456"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none tracking-[0.5em] text-center font-bold text-xl"
                required
              />
              <p className="text-xs text-slate-400 text-center">Enviámos um SMS para {phone}</p>
            </div>
          ) : null}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {useOTP && !otpSent ? (
            <button
              type="button"
              onClick={sendOTP}
              disabled={isLoading || !phone}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              Pedir Código
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'A autenticar...' : 'Entrar na App'}
              <ShieldCheck className="w-5 h-5" />
            </button>
          )}
        </form>

        <p className="text-xs text-slate-400 text-center px-4">
          Ao entrar, concordas com a nossa política de privacidade e partilha de datas de aniversário com o teu círculo.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

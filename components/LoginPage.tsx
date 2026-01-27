
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { Smartphone, Lock, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const syncStages = [
    { progress: 20, message: 'A ligar ao servidor...' },
    { progress: 50, message: 'A validar credenciais e encriptação...' },
    { progress: 80, message: 'A descarregar timeline e relações...' },
    { progress: 100, message: 'Sincronização concluída!' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Fase de Validação Local/Simulada
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.phone === phone);
      if (user) {
        const isAdmin = phone === '917772010';
        const validPassword = isAdmin ? '123456' : '123';

        const isAuthValid = (!useOTP && password === validPassword) || (useOTP && otpCode === '123456');

        if (isAuthValid) {
           // 2. Se as credenciais forem válidas, inicia a Sincronização
           startSynchronization(user, isAdmin);
        } else {
           setError(`Credenciais inválidas para o número ${phone}.`);
           setIsLoading(false);
        }
      } else {
        setError('Utilizador não encontrado no sistema.');
        setIsLoading(false);
      }
    }, 800);
  };

  const startSynchronization = (user: User, isAdmin: boolean) => {
    setIsLoading(false);
    setIsSyncing(true);
    
    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < syncStages.length) {
        setSyncProgress(syncStages[stageIndex].progress);
        setSyncStatus(syncStages[stageIndex].message);
        stageIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onLogin({ ...user, mustChangePassword: !isAdmin && password === '123' });
        }, 500);
      }
    }, 600);
  };

  const sendOTP = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSyncing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Sincronizando...</h2>
            <p className="text-slate-500 text-sm h-5">{syncStatus}</p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Não feche a aplicação durante este processo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm border border-indigo-100">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Timeline de Aniversários</h1>
          <p className="text-slate-500 text-sm px-4">Faz login para aceder à tua rede privada de celebrações.</p>
        </div>

        <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
          <button
            onClick={() => { setUseOTP(false); setOtpSent(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!useOTP ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setUseOTP(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${useOTP ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Código SMS
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Telemóvel</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="Ex: 917772010"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {!useOTP ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          ) : otpSent ? (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Código de 6 dígitos</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Ex: 123456"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none tracking-[0.5em] text-center font-bold text-2xl text-indigo-600"
                required
              />
              <p className="text-[10px] text-slate-400 text-center font-medium">Enviámos um SMS de confirmação para {phone}</p>
            </div>
          ) : null}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {useOTP && !otpSent ? (
            <button
              type="button"
              onClick={sendOTP}
              disabled={isLoading || !phone}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              Pedir Código
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar na App
                  <ShieldCheck className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </form>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center px-4 leading-relaxed font-medium">
            A segurança dos teus dados é prioritária. Todos os dados são encriptados ponta-a-ponta e as relações são validadas pelo círculo.
          </p>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default LoginPage;

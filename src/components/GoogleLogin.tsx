import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, Check, Key, Mail, Lock } from 'lucide-react';

interface GoogleLoginProps {
  onLoginSuccess: (user: { name: string; email: string; photoUrl: string }) => void;
}

export default function GoogleLogin({ onLoginSuccess }: GoogleLoginProps) {
  const [selectedEmail, setSelectedEmail] = useState<string>('jakessrodriguezz@gmail.com');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [authStep, setAuthStep] = useState<'welcome' | 'selecting' | 'password' | 'loading'>('welcome');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const defaultUser = {
    name: 'Jakes Rodriguez',
    email: 'jakessrodriguezz@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  };

  const alternativeUser = {
    name: 'Invitado JR',
    email: 'info@jrcrm.eus',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
  };

  const handleStartLogin = () => {
    setAuthStep('selecting');
  };

  const proceedLogin = (email: string) => {
    setAuthStep('loading');
    setIsConnecting(true);

    // Simulate Google OAuth authenticating sequence
    setTimeout(() => {
      const activeUser = email === 'jakessrodriguezz@gmail.com' ? defaultUser : {
        ...alternativeUser,
        email: email
      };
      onLoginSuccess(activeUser);
      setIsConnecting(false);
    }, 1800);
  };

  const handleSelectAccount = (email: string) => {
    setSelectedEmail(email);
    if (email === 'jakessrodriguezz@gmail.com') {
      setAuthStep('password');
      setPasswordInput('');
      setPasswordError('');
    } else {
      proceedLogin(email);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0161') {
      proceedLogin('jakessrodriguezz@gmail.com');
    } else {
      setPasswordError('Contraseña incorrecta');
    }
  };

  return (
    <div id="google-login-container" className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#E1E8ED]">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#1B365D]/8 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/8 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {authStep === 'welcome' && (
            <motion.div
              key="welcome-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 flex flex-col text-center"
            >
              {/* Product Badge */}
              <div className="mx-auto bg-[#1B365D]/10 text-[#1B365D] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-6 flex items-center gap-1.5 w-fit">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acceso Administrador Seguro
              </div>

              {/* Logo / Brand */}
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="w-3.5 h-3.5 bg-[#1B365D] rounded-full animate-bounce"></div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#2C3E50] font-sans">
                  JR <span className="text-[#1B365D]">CRM</span>
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-8 max-w-xs mx-auto">
                Gestión de prospección y control de clientes locales de Urretxu y Zumarraga.
              </p>

              {/* Main Google Login Trigger */}
              <button
                id="btn-trigger-google-oauth"
                onClick={handleStartLogin}
                className="w-full py-4 px-6 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs font-bold text-[#2C3E50] transition-all duration-300 flex items-center justify-center gap-3 group active:scale-98 cursor-pointer"
              >
                {/* Simulated Google Colored G Logo Layout */}
                <div className="w-5 h-5 flex items-center justify-center bg-transparent relative">
                  <div className="absolute inset-0 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden font-sans font-bold text-sm bg-neutral-100 text-blue-600">
                    G
                  </div>
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-700">
                  Iniciar sesión con Google
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 pt-6 border-t border-white/40 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1 uppercase">
                  <Lock className="h-3 w-3 text-slate-400" /> Google Identity Secure
                </span>
                <span className="uppercase">v2.1.0-prod</span>
              </div>
            </motion.div>
          )}

          {authStep === 'selecting' && (
            <motion.div
              key="selector-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 flex flex-col"
            >
              <h3 className="text-lg font-extrabold text-[#1B365D] mb-1 tracking-tight text-center">
                Selecciona una cuenta
              </h3>
              <p className="text-xs font-medium text-slate-400 text-center mb-6">
                para continuar en <span className="font-bold text-[#1B365D]">JR CRM</span>
              </p>

              <div className="space-y-3 mb-6">
                {/* Principal User Quick Selector (jakessrodriguezz) */}
                <button
                  id="account-option-principal"
                  onClick={() => handleSelectAccount('jakessrodriguezz@gmail.com')}
                  className="w-full p-4 bg-white/60 hover:bg-white border border-white/80 rounded-2xl transition-all duration-200 text-left flex items-center justify-between group active:scale-99 cursor-pointer shadow-xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={defaultUser.photoUrl}
                      alt="Jakes"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#2C3E50] group-hover:text-[#1B365D] transition-colors">
                        {defaultUser.name}
                      </div>
                      <div className="text-xs font-semibold text-slate-400">
                        {defaultUser.email}
                      </div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-3 h-3" />
                  </div>
                </button>

                {/* Alternative Account Options */}
                <button
                  id="account-option-guest"
                  onClick={() => handleSelectAccount('info@jrcrm.eus')}
                  className="w-full p-4 bg-white/40 hover:bg-white/70 border border-white/60 rounded-2xl transition-all duration-200 text-left flex items-center justify-between group active:scale-99 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={alternativeUser.photoUrl}
                      alt="Invitado"
                      className="w-10 h-10 rounded-full object-cover grayscale opacity-75 border border-white/80"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-600">
                        {alternativeUser.name}
                      </div>
                      <div className="text-xs font-semibold text-slate-400">
                        {alternativeUser.email}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                id="btn-back-to-welcome"
                onClick={() => setAuthStep('welcome')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 text-center transition-all underline cursor-pointer"
              >
                Volver atrás
              </button>
            </motion.div>
          )}

          {authStep === 'password' && (
            <motion.div
              key="password-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 flex flex-col"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <img
                  src={defaultUser.photoUrl}
                  alt="Jakes"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md mb-3"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-xl font-extrabold text-[#1B365D] tracking-tight">
                  Verifica tu identidad
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Introduce el PIN de administrador para <br />
                  <span className="text-[#1B365D] font-bold">{defaultUser.email}</span>
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                    Código de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={8}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="PIN o contraseña"
                      className="w-full text-center tracking-widest text-[#1B365D] placeholder:tracking-normal font-extrabold text-lg bg-white/60 focus:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all duration-200 shadow-inner"
                      autoFocus
                    />
                  </div>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-red-500 text-center mt-2.5"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-[#1B365D] hover:bg-[#132743] text-white rounded-2xl shadow-md font-bold text-sm tracking-wide transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-98"
                >
                  <Key className="w-4 h-4" />
                  CONFIRMAR CREDENCIALES
                </button>
              </form>

              <button
                type="button"
                onClick={() => setAuthStep('selecting')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 text-center transition-all underline cursor-pointer mt-6"
              >
                Elegir otra cuenta
              </button>
            </motion.div>
          )}

          {authStep === 'loading' && (
            <motion.div
              key="loading-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 flex flex-col items-center text-center justify-center"
            >
              {/* Spinner */}
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#1B365D]/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#1B365D] animate-spin"></div>
              </div>

              <h3 className="text-base font-extrabold text-[#1B365D] uppercase tracking-wider animate-pulse mb-1">
                Autenticando...
              </h3>
              <p className="text-xs font-semibold text-slate-500 max-w-xs">
                Iniciando sesión segura mediante Google Accounts para <br />
                <span className="text-[#1B365D] font-bold">{selectedEmail}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

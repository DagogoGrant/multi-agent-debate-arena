import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login, emailLogin, emailSignup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await emailLogin(email, password);
      } else {
        await emailSignup(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden flex flex-col">
          
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
              ArgueMind Access
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? "Sign in to your account" : "Create a new secure account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="w-4 h-4 text-slate-500" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button 
            onClick={login}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-6 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 font-bold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500/50 font-medium">
            <Lock className="w-3 h-3" />
            <span>Secure 256-bit encrypted session</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

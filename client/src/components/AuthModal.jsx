import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, AlertCircle, CheckCircle, X } from 'lucide-react';

function AuthModal({ isOpen, onClose, onAuthSuccess, csrfToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!isLogin && !/^[a-zA-Z0-9\-_]{3,30}$/.test(username)) {
      setError('Username must be alphanumeric, 3-30 characters.');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (isLogin) {
        setSuccess('Successfully authenticated!');
        setTimeout(() => {
          onAuthSuccess(data.user, data.csrfToken);
          handleClose();
        }, 800);
      } else {
        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          {/* Modal Background click listener */}
          <motion.div 
            className="absolute inset-0" 
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Paper container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md p-8 rounded-2xl border border-ink/20 shadow-2xl bg-[#FCFAF5] text-ink z-10 font-sans"
          >
            {/* Paper clip decorative element */}
            <div className="paperclip-clip"><div className="paperclip-inner" /></div>

            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-ink/10 text-ink/40 hover:text-inkRed hover:border-inkRed/30 transition-colors bg-parchment shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="font-garamond font-bold text-3xl uppercase tracking-wider text-ink">
                {isLogin ? 'Sign In' : 'Register'}
              </h3>
              <p className="marginal-note mt-1 text-brass font-bold italic">
                {isLogin ? 'Access your administrative dashboard' : 'Create your secure journal identity'}
              </p>
            </div>

            {/* Error and Success alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg border border-inkRed/20 bg-parchment/60 text-inkRed text-xs font-bold font-mono flex items-start gap-2 shadow-inner"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg border border-inkGreen/20 bg-parchment/60 text-inkGreen text-xs font-bold font-mono flex items-start gap-2 shadow-inner"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-extrabold uppercase text-ink/50 tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. fahad_nawaz"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-ink/15 text-sm bg-parchment text-ink placeholder:text-ink/30 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-extrabold uppercase text-ink/50 tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-ink/15 text-sm bg-parchment text-ink placeholder:text-ink/30 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brass hover:bg-brass/90 text-parchment font-mono font-bold text-xs uppercase shadow tracking-wider transition-colors disabled:opacity-50 mt-6"
              >
                {loading ? 'Processing...' : isLogin ? 'Authenticate' : 'Register Profile'}
              </button>
            </form>

            {/* Toggle login/register */}
            <div className="border-t border-dashed border-ink/10 mt-6 pt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-ink/60 hover:text-brass transition-colors font-mono font-bold underline underline-offset-4"
              >
                {isLogin ? "Need a profile? Register here" : "Already registered? Login here"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
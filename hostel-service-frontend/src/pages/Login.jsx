import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data);
      if (data.role === 'student') navigate('/student-dashboard');
      else if(data.role === 'sic') navigate('/sic-dashboard');
      else if(data.role == 'admin') navigate('/admin-dashboard');
      else navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05070A]">
      {/* Left Side: Brand & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-900">
        <img 
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          alt="Hostel"
        />
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">HostelHub</span>
          </div>
          <h1 className="text-6xl font-bold leading-tight mb-6">
            Vellore Institute of <br /> Technology
          </h1>
          <p className="text-xl text-slate-300 max-w-md">
            The Digital Concierge for modern properties. Experience a management interface designed for clarity.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-slate-400">Welcome back. Enter your credentials to access the portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username or Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111418] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="manager@hostelhub.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <button type="button" className="text-sm text-blue-500 hover:text-blue-400">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111418] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button className="w-full bg-[#5E5CE6] hover:bg-[#4B49C7] text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-95">
              Sign In
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-800">
             <p className="text-center text-slate-500">
               Don't have an account? <button className="text-blue-500 font-medium">Request Access</button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Trash2,
  Search,
  Users,
  Calendar,
  Clock,
  LayoutDashboard,
  Menu,
  X,
  Lock,
  Download
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Registration {
  id: string;
  name: string;
  semester: string;
  section: string;
  branch: string;
  degree: string;
  createdAt: string;
}

interface FormData {
  name: string;
  semester: string;
  section: string;
  branch: string;
  degree: string;
}

const INITIAL_DATA: FormData = {
  name: '',
  semester: '',
  section: '',
  branch: '',
  degree: '',
};

export default function App() {
  const [view, setView] = useState<'register' | 'admin-login' | 'admin-dashboard'>('register');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Admin State
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  useEffect(() => {
    if (adminToken && view === 'admin-dashboard') {
      fetchRegistrations();
    }
  }, [adminToken, view]);

  const fetchRegistrations = async () => {
    setIsLoadingAdmin(true);
    try {
      const response = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': adminToken || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAdmin(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setView('admin-dashboard');
        setAdminPassword('');
      } else {
        setErrorMessage(data.error);
      }
    } catch (err) {
      setErrorMessage("Login failed");
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setView('register');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': adminToken || '' }
      });
      if (response.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };
  
  const handleDownload = () => {
    if (!adminToken) return;
    window.open(`/api/admin/download?token=${adminToken}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status !== 'idle') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to register');
      }

      setStatus('success');
      setFormData(INITIAL_DATA);
    } catch (err) {
      console.error("Registration error:", err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.degree.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://c4.wallpaperflare.com/wallpaper/142/751/831/landscape-anime-digital-art-fantasy-art-wallpaper-preview.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setView('register')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-auto bg-white/90 rounded-md p-1 flex items-center justify-center">
                <img 
                  src="https://files.reva.ac.in/assets/frontend/images/logo-icon.png" 
                  alt="REVA Logo" 
                  className="h-full w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tighter leading-none">REVA</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-purple-300">UNIVERSITY</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {adminToken ? (
              <>
                <button 
                  onClick={() => setView('admin-dashboard')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                    view === 'admin-dashboard' ? "bg-white/20 text-white" : "text-zinc-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => setView(view === 'admin-login' ? 'register' : 'admin-login')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'register' && (
          <motion.main 
            key="register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20"
          >
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              
              {/* Left Side: Detailed Info from Image */}
              <div className="lg:col-span-3 space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-purple-300 font-display font-bold text-lg tracking-wide">School of Computer Science and Engineering</h3>
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-[0.3em]">Organises Webinar on</p>
                  </div>

                  <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter leading-[0.9] text-white">
                    AI GOVERNANCE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                      & REGULATION
                    </span>
                  </h1>
                  
                  <p className="text-2xl font-medium text-zinc-300 italic">
                    India and the World Order
                  </p>

                  <div className="glass rounded-3xl p-8 space-y-6 border-purple-500/20">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <User className="text-purple-400 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Speaker</p>
                        <h4 className="text-xl font-bold text-white">Dr. S Vijayakumar</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed mt-1">
                          Professor, Department of Computer Science Engineering, <br />
                          Gokaraju Rangaraju Institute of Engineering and Technology, Hyderabad.
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Calendar className="text-cyan-400 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Schedule</p>
                        <p className="text-lg font-bold text-white">March 3, 2026 | 2:30 PM to 3:30 PM</p>
                        <p className="text-zinc-400 text-sm">Online Mode</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-2xl border-white/5">
                      <p className="text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-3">Conveners</p>
                      <ul className="space-y-1 text-sm text-zinc-300 font-medium">
                        <li>Dr. Ashwinkumar U M</li>
                        <li>Dr. P V Bhaskar Reddy</li>
                      </ul>
                    </div>
                    <div className="glass p-6 rounded-2xl border-white/5">
                      <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-3">Coordinators</p>
                      <ul className="space-y-1 text-sm text-zinc-300 font-medium">
                        <li>Prof. Mola B M</li>
                        <li>Dr. T Y Satheesha</li>
                        <li>Dr. Bhavatarini N</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Registration Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="glass rounded-[2.5rem] p-8 lg:p-10 border-white/10 shadow-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
                  
                  <div className="relative z-10">
                    <div className="mb-8">
                      <h2 className="text-3xl font-display font-black mb-2">Register Now</h2>
                      <p className="text-zinc-500 text-sm font-medium">Fill in your details to join the session.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="glass-input w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Semester</label>
                          <select
                            required
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            className="glass-input w-full appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="bg-[#1a1a1a] text-zinc-400">Select</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                              <option key={s} value={s} className="bg-[#1a1a1a] text-zinc-100">Sem {s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Section</label>
                          <input
                            required
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            placeholder="Sec"
                            className="glass-input w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Branch</label>
                        <input
                          required
                          type="text"
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          placeholder="Branch"
                          className="glass-input w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Degree</label>
                        <input
                          required
                          type="text"
                          name="degree"
                          value={formData.degree}
                          onChange={handleChange}
                          placeholder="Degree"
                          className="glass-input w-full"
                        />
                      </div>

                      <AnimatePresence mode="wait">
                        {status === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"
                          >
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            Registration successful!
                          </motion.div>
                        )}
                        {status === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold"
                          >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {errorMessage}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 mt-4"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Submit Registration
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.main>
        )}

        {view === 'admin-login' && (
          <motion.main 
            key="admin-login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Lock className="w-8 h-8 text-brand-orange" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Admin Portal</h2>
                <p className="text-zinc-500">Enter your credentials to access the dashboard.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                  <input
                    required
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-brand-orange/50 transition-all placeholder:text-zinc-800"
                  />
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <button
                  disabled={isLoadingAdmin}
                  type="submit"
                  className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                >
                  {isLoadingAdmin ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
                </button>
              </form>
            </div>
          </motion.main>
        )}

        {view === 'admin-dashboard' && (
          <motion.main 
            key="admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-display font-bold mb-2">Registrations</h1>
                <div className="flex items-center gap-3">
                  <p className="text-zinc-500">Manage and view all webinar participants.</p>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                    registrations.length > 0 || !isLoadingAdmin ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  )}>
                    Live Database
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-brand-orange transition-colors" />
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-orange/50 transition-all w-full md:w-64"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
                  <Users className="w-5 h-5" />
                  <span className="font-bold">{registrations.length}</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all font-bold text-sm"
                >
                  <Download className="w-5 h-5" />
                  Download Details
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Branch / Degree</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Sem / Sec</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Registered At</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoadingAdmin ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-orange" />
                        </td>
                      </tr>
                    ) : filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((reg) => (
                        <motion.tr 
                          layout
                          key={reg.id} 
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="font-bold text-zinc-100">{reg.name}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-zinc-400 text-sm">{reg.branch}</div>
                            <div className="text-zinc-600 text-xs">{reg.degree}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-zinc-400 text-sm">S{reg.semester} - {reg.section}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-zinc-500 text-xs flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {new Date(reg.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={() => handleDelete(reg.id)}
                              className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-zinc-600">
                          No registrations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

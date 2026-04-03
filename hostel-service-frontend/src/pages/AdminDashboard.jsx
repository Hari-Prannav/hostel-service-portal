import React, { useState, useContext , useEffect} from 'react';
import { UserPlus, HardHat, ShieldCheck, Save, RefreshCcw , LogOut} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; // Assuming your axios instance is here

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState('student');
  const [loading, setLoading] = useState(false);
  const initialState = {
  // Common fields
  name: '', 
  email: '', 
  password: '', 
  
  // Student Specific
  roomNumber: '', 
  registrationNumber: '', 
  block: '', // Added to match the 'block' field you mentioned earlier
  
  // Worker Specific (Matched to your DB)
  staffId: '',      // Matches "staffId"
  sector: '',       // Matches "sector" (Department)
  currentStatus: 'Online', // Matches "currentStatus"
  assignedBlock: '', // Matches "assignedBlock"
  
  // SIC Specific
  sicId: '', 
  phone: ''
};
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    setFormData(initialState);
  }, [activeForm]);

  const handleLogout = () => {
    console.log("Logging out..."); // Debugging check
    logout(); 
    navigate('/login'); // Always navigate AFTER clearing state
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Send the activeForm (student/worker/sic) as the 'role' field
        const payload = { ...formData, role: activeForm }; 
        
        // Hit the protected register route
        await API.post('/auth/register', payload);
        
        alert(`${activeForm.toUpperCase()} added successfully!`);
        setFormData(initialState);
        // ... clear form
    } catch (err) {
        alert(err.response?.data?.message || "Entry failed");
    } finally {
        setLoading(false);
    }
    };

  const tabs = [
    { id: 'student', label: 'Add Student', icon: <UserPlus size={18} /> },
    { id: 'worker', label: 'Add Worker', icon: <HardHat size={18} /> },
    { id: 'sic', label: 'Add SIC', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Systems Administration</h1>
            <p className="text-slate-400 text-sm">Create and authorize new database entries</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all group">
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </header>

        {/* Tab Selection */}
        <div className="flex bg-[#1e293b] p-1 rounded-xl mb-6 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveForm(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeForm === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl shadow-2xl p-8 relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" name="fake-username" autoComplete="username" style={{ display: 'none' }} />
            <input type="password" name="fake-password" autoComplete="current-password" style={{ display: 'none' }} />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="john@university.edu" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Temporary Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="••••••••" />
              </div>

              {/* Student Fields */}
              {activeForm === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Room Number</label>
                    <input required name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="B-204" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Reg Number</label>
                    <input required name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="2023CS01" />
                  </div>
                </>
              )}

              {/* Worker Fields */}
              {/* Conditional Fields: Worker */}
              {activeForm === 'worker' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Staff ID</label>
                    <input 
                      required 
                      name="staffId" // 🚀 Matches initialState
                      value={formData.staffId} 
                      onChange={handleInputChange} 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" 
                      placeholder="VIT-M-042" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Sector (Department)</label>
                    <select 
                      required 
                      name="sector" // 🚀 Matches initialState
                      value={formData.sector} 
                      onChange={handleInputChange} 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none appearance-none"
                    >
                      <option value="">Select Sector...</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Assigned Block</label>
                    <input 
                      required 
                      name="assignedBlock" // 🚀 Matches initialState
                      value={formData.assignedBlock} 
                      onChange={handleInputChange} 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" 
                      placeholder="B Block" 
                    />
                  </div>
                </>
              )}

              {/* SIC Fields */}
              {activeForm === 'sic' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">SIC ID</label>
                    <input required name="sicId" value={formData.sicId} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="SIC-9901" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Phone Number</label>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="+91 00000 00000" />
                  </div>
                </>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
              Confirm Entry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
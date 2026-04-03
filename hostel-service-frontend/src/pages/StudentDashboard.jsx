import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  Bell, User, Wrench, Zap, Droplets, Eraser, 
  ArrowRight, Clock, Circle, X, Send , CheckCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFullHistory, setShowFullHistory] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/requests/my');
      console.log("Fetched Requests:", data); // Check your browser console!
      setRequests(data); 
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openRequestModal = (service) => {
  setSelectedService(service);
  // Extract category from title (e.g., "Room Cleaning" -> "Cleaning")
  const cat = service.title.includes(' ') ? service.title.split(' ')[1] : service.title;
  setCategory(cat); 
  setIsModalOpen(true);
};

  const handleModalClose = () => {
    setIsModalOpen(false);
    setDescription('');
    setSelectedService(null);
  };

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token'); // Or however you store it
    const res = await API.get('/requests/my', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setRequests(res.data);
  } catch (err) {
    console.error("Fetch failed:", err); // This is where your error is triggering
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!description.trim()) return alert("Please describe the issue.");

  setIsSubmitting(true); // Start loading
  try {
    const res = await API.post('/requests', { category, description });
    if (res.status === 201) {
      alert("Request Submitted!");
      handleModalClose(); // Close modal on success
      await fetchRequests();    // Refresh the "Recent Requests" list
    }
  } catch (err) {
    console.error("Submission Error:", err.response?.data || err.message);
    alert("Failed to submit.");
  } finally {
    setIsSubmitting(false); // Stop loading
  }
};

const handleResolve = async (requestId) => {
  try {
    await API.patch(`/requests/${requestId}/resolve`);
    
    // CHANGE THIS:
    // onRefresh(); <--- Delete this (it doesn't exist here)
    
    // TO THIS:
    fetchData(); // <--- Call your local data fetching function
    
    alert("Service marked as resolved!");
  } catch (err) {
    console.error("Resolution failed:", err);
  }
};

  


  const services = [
    { title: 'Room Cleaning', icon: <Eraser />, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Schedule a professional deep clean for your dorm room.' },
    { title: 'General Repair', icon: <Wrench />, color: 'text-slate-400', bg: 'bg-slate-400/10', desc: 'Furniture fix, door issues, or wall maintenance needs.' },
    { title: 'Electricity', icon: <Zap />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Fix faulty outlets, lights, or wiring concerns.' },
    { title: 'Plumbing', icon: <Droplets />, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'Leaks, blockages, or bathroom fixture repairs.' },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans relative">
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={handleModalClose}
          ></div>
          
          <div className="relative bg-[#111418] border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
            <button 
              onClick={handleModalClose}
              className="absolute right-6 top-6 text-slate-500 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 ${selectedService?.bg} ${selectedService?.color} rounded-xl flex items-center justify-center`}>
                {selectedService?.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedService?.title}</h3>
                <p className="text-slate-500 text-sm">New Service Request</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Service Category
                    </label>
                    <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-blue-500 outline-none transition-all"
                    >
                    <option value="Cleaning">Cleaning</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="General">General Repair</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Issue Description
                    </label>
                    <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="e.g. The light in the bathroom is flickering..."
                    rows="4"
                    className="w-full bg-[#05070A] border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    {isSubmitting ? "Submitting..." : <><Send size={18} /> Submit Request</>}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-[#05070A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">H</div>
          <span className="font-bold text-xl tracking-tight">HostelHub</span>
        </div>
        <div className="flex items-center gap-5 text-slate-400">
          <Bell size={20} className="hover:text-white cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User size={18} />
          </div>
          <button onClick={logout} className="text-sm font-medium hover:text-red-400 transition-colors">Logout</button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-5xl font-bold mb-2 tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
              <p className="text-slate-400 text-lg">Select a service to get started with your request.</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-[#111418] p-4 rounded-2xl border border-slate-800 min-w-[140px]">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Room</p>
                  <p className="text-2xl font-bold text-blue-500">{user?.roomNumber || 'N/A'}</p>
               </div>
               <div className="bg-[#111418] p-4 rounded-2xl border border-slate-800 min-w-[140px]">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Building</p>
                  <p className="text-2xl font-bold text-slate-200">{user?.block || 'N/A'}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s, idx) => (
              <div 
                key={idx} 
                onClick={() => openRequestModal(s)}
                className="bg-[#111418] p-8 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all group cursor-pointer shadow-2xl shadow-black/50"
              >
                <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-6`}>
                  {s.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-400 mb-6 leading-relaxed text-sm">{s.desc}</p>
                <div className="flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all">
                  Request Now <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111418] rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {showFullHistory ? 'All Service History' : 'Recent Requests'}
              </h3>
              <Clock size={18} className="text-slate-600" />
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {requests.length > 0 ? (
                // Logic: If not showing full history, slice the first 3. Otherwise, show all.
                (showFullHistory ? requests : requests.slice(0, 3)).map((r, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50 group transition-all hover:border-slate-700">
                    <div className="flex gap-4 items-start">
                      <div className={`p-3 rounded-xl ${
                          r.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 
                          r.status === 'Resolved' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-slate-400'
                        }`}>
                        <Zap size={16}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-200">{r.category}</p>
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                            r.status === 'Pending' ? 'border-yellow-500/50 text-yellow-500' : 
                            r.status === 'In Progress' ? 'border-blue-500/50 text-blue-500' : 
                            'border-green-500/50 text-green-500'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{r.description}</p>
                        <p className="text-[10px] text-slate-600 mt-2">
                          Requested on: {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Button for 'In Progress' tasks */}
                    {r.status === 'In Progress' && (
                      <button 
                        onClick={() => handleResolve(r._id)}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl border border-green-500/20 text-xs font-bold transition-all"
                      >
                        <CheckCircle size={14} /> MARK DONE
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-600 text-sm italic">No recent activity.</div>
              )}
            </div>

            {/* TOGGLE BUTTON */}
            {requests.length > 3 && (
              <button 
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="w-full mt-8 py-4 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                {showFullHistory ? "Show Less" : "View Full History"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
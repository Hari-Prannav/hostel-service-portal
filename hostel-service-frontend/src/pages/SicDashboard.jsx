import { useState, useEffect, useContext ,useMemo} from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, ClipboardList, HardHat, 
  LogOut, Bell, User, Zap, TrendingUp, AlertCircle, 
  CheckCircle, Clock3, UserPlus, Search, Filter,
  ChevronLeft, ChevronRight,Activity,MapPin
} from 'lucide-react';
import API from '../services/api';

const SicDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [requests, setRequests] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // 1. Unified Fetch Logic
  const fetchData = async () => {
    try {
      const reqRes = await API.get('/requests');
      const staffRes = await API.get('/requests/personnel');
      setRequests(reqRes.data);
      setPersonnel(staffRes.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const sectors = ['Cleaning', 'Electrical', 'Plumbing', 'IT Support'];
    const totalWorkforce = personnel.length;

    const distribution = sectors.map(name => {
      const sectorStaff = personnel.filter(p => p.sector === name);
      // Logic: Staff is "Active" if they are Busy
      const activeStaff = sectorStaff.filter(p => p.currentStatus === 'Busy');
      return {
        name,
        total: sectorStaff.length,
        active: activeStaff.length,
        percentage: sectorStaff.length > 0 ? Math.round((activeStaff.length / sectorStaff.length) * 100) : 0
      };
    });

    return { totalWorkforce, distribution };
  }, [personnel]);

  return (
    <div className="flex min-h-screen bg-[#05070A] text-white font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-800 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">V</div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white">VIT Vellore</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Hostel Service In-charge</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'Overview', icon: <LayoutDashboard size={20}/> },
            { id: 'Service Requests', icon: <ClipboardList size={20}/> },
            { id: 'Maintenance', icon: <HardHat size={20}/> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              {item.icon} <span className="text-sm font-semibold">{item.id}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={20}/> <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-[#05070A]">
        <header className="px-10 py-5 border-b border-slate-800 flex justify-between items-center sticky top-0 z-10 bg-[#05070A]">
          <h1 className="text-xl font-bold">{activeTab}</h1>
        </header>

        <div className="p-10 max-w-[1700px] mx-auto">
          {/* PASS STATS TO OVERVIEW HERE */}
          {activeTab === 'Overview' && <OverviewView requests={requests} stats={stats} onRefresh={fetchData} />}
          
          {activeTab === 'Service Requests' && (
            <ServiceQueueView 
              requests={requests} 
              setSelectedRequest={setSelectedRequest} 
              setIsDeployModalOpen={setIsDeployModalOpen} 
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'Maintenance' && <MaintenanceView personnel={personnel} onRefresh={fetchData} />}
        </div>
      </main>

      {/* --- DEPLOYMENT MODAL --- */}
      {isDeployModalOpen && selectedRequest && (
        <DeploymentModal 
          request={selectedRequest}
          personnel={personnel}
          onClose={() => setIsDeployModalOpen(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

const ManualAssignModal = ({ staff, onClose, onRefresh }) => {
  const [taskData, setTaskData] = useState({ room: '', description: '' });

  const handleManualSubmit = async () => {
    if (!taskData.room || !taskData.description) return alert("Fill all fields");
    
    try {
      await API.patch(`/requests/personnel/${staff._id}/manual-assign`, taskData);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err.response?.data);
      alert("Manual assignment failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111418] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Manual Deployment</h3>
        <p className="text-slate-400 text-xs mb-6 font-medium">Assigning: {staff.name} ({staff.sector})</p>
        
        <input 
          placeholder="Room or Floor (e.g., B-402)"
          className="w-full bg-[#05070A] border border-slate-700 rounded-xl p-3 text-white mb-4 outline-none focus:border-blue-500"
          value={taskData.room}
          onChange={(e) => setTaskData({...taskData, room: e.target.value})}
        />
        
        <textarea 
          placeholder="Service Description..."
          className="w-full bg-[#05070A] border border-slate-700 rounded-xl p-3 text-white mb-6 outline-none focus:border-blue-500 h-24"
          value={taskData.description}
          onChange={(e) => setTaskData({...taskData, description: e.target.value})}
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold hover:text-white">Cancel</button>
          <button onClick={handleManualSubmit} className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-700">Assign Worker</button>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-VIEW: SERVICE QUEUE --- */
const ServiceQueueView = ({ requests, onRefresh, setSelectedRequest, setIsDeployModalOpen }) => {
  
  const handleResolve = async (requestId) => {
    try {
      // This hits the backend logic we wrote above
      await API.patch(`/requests/${requestId}/resolve`);
      
      // This triggers the parent to fetch fresh 'Personnel' and 'Requests'
      onRefresh(); 
      
      alert("Worker status updated to Online!");
    } catch (err) {
      console.error("Failed to sync status");
    }
  };

  return (

  <div className="animate-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-end mb-8 gap-4">
      <div>
        <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Live Service Queue</h2>
        <p className="text-slate-400">Manage and track ongoing maintenance requests across campus.</p>
      </div>
    </div>
    <div className="bg-[#111418] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-[#1A1D23] text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border-b border-slate-800">
          <tr>
            <th className="p-6">Request ID</th>
            <th className="p-6">Student Details</th>
            <th className="p-6">Room No</th>
            <th className="p-6">Service Type</th>
            <th className="p-6">Status</th>
            <th className="p-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {requests.map((req, idx) => (
            <tr key={req._id} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-6 font-mono text-xs text-blue-500">#REQ-{idx + 1000}</td>
              <td className="p-6 text-sm text-slate-200">{req.student?.name}</td>
              <td className="p-6 text-sm text-slate-200">{req.student?.roomNumber}</td>
              <td className="p-6">
                <span className="bg-slate-800 px-3 py-1 rounded text-[10px] font-bold text-slate-400 border border-slate-700 uppercase">
                  {req.category}
                </span>
              </td>
              <td className="p-6 text-xs">
                <span className={req.status === 'Pending' ? 'text-yellow-500' : 'text-blue-500'}>{req.status}</span>
              </td>
              <td className="p-6 text-center">
                {req.status === 'Pending' && (
                  <button 
                    onClick={() => { setSelectedRequest(req); setIsDeployModalOpen(true); }}
                    className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white"
                  >
                    <UserPlus size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

/* --- ACTUAL MODAL COMPONENT --- */
const DeploymentModal = ({ request, personnel, onClose, onRefresh }) => {
  const [selectedWorker, setSelectedWorker] = useState('');

  const handleAssign = async () => {
    if (!selectedWorker) return alert("Select a worker");
    try {
      await API.patch(`/requests/${request._id}/assign`, { workerId: selectedWorker });
      onRefresh();
      onClose();
    } catch (err) { alert("Assignment failed"); }
  };

  const availableWorkers = personnel.filter(p => 
    p.currentStatus === 'Online' && 
    p.sector === request.category &&
    p.assignedBlock === "Block B"
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#111418] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Deploy Worker</h3>
        
        <select 
          className="w-full bg-[#05070A] border border-slate-700 rounded-xl p-3 text-white mb-6 outline-none focus:border-blue-500"
          onChange={(e) => setSelectedWorker(e.target.value)}
        >
          <option value="">Select an Online Worker...</option>
          {availableWorkers.map(w => (
            <option key={w._id} value={w._id}>{w.name} (Tasks: {w.activeTasks || 0})</option>
          ))}
        </select>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold hover:text-white">Cancel</button>
          <button onClick={handleAssign} className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-VIEW 1: EXECUTIVE OVERVIEW (Now includes dynamic Stat Cards) --- */
const OverviewView = ({ requests, stats , onRefresh}) => {
  // 1. Calculate Core Stats
  const handleSomeAction = async () => {
    await API.patch('/some-endpoint');
    onRefresh(); // ✅ This will now work!
  }
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  
  const completionRate = totalRequests > 0 
    ? Math.round((resolvedCount / totalRequests) * 100) 
    : 0;

  // 2. Real-time Sector Load Calculation
  // We calculate "load" based on how many non-resolved requests each sector has
  const getSectorLoad = (category) => {
    const sectorRequests = requests.filter(r => r.category?.toLowerCase() === category.toLowerCase());
    if (sectorRequests.length === 0) return 0;
    const activeSectorRequests = sectorRequests.filter(r => r.status !== 'Resolved').length;
    return Math.min(Math.round((activeSectorRequests / sectorRequests.length) * 100), 100);
  };

  const overviewStats = [
    { label: 'Pending Requests', value: pendingCount, change: 'Requires attention', icon: <Clock3 size={20} className="text-yellow-500"/> },
    { label: "Today's Completion", value: `${completionRate}%`, change: `${resolvedCount} of ${totalRequests} fixed`, icon: <CheckCircle size={20} className="text-green-500"/> },
    { label: 'In Progress', value: inProgressCount, change: 'Currently being worked on', icon: <Zap size={20} className="text-blue-500"/> },
    { label: 'Total Volume', value: totalRequests, change: 'All-time requests', icon: <TrendingUp size={20} className="text-slate-400"/> },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {overviewStats.map((stat, i) => (
            <div key={i} className="bg-[#111418] p-6 rounded-3xl border border-slate-800 shadow-xl">
               <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-medium text-slate-300">{stat.label}</p>
                  {stat.icon}
               </div>
               <p className="text-5xl font-extrabold text-white tracking-tighter mb-2">{stat.value}</p>
               <p className="text-xs text-slate-500">{stat.change}</p>
            </div>
         ))}
      </div>

      {/* Urgency Matrix Section */}
      <div className="bg-[#111418] border border-slate-800 rounded-3xl p-6">
         <h3 className="font-bold mb-6 text-white text-lg">Live Urgency Breakdown</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
               <p className="text-4xl font-black text-red-500 mb-1">{pendingCount}</p>
               <p className="text-sm font-bold text-slate-200">Critical (Pending)</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl">
               <p className="text-4xl font-black text-blue-500 mb-1">{inProgressCount}</p>
               <p className="text-sm font-bold text-slate-200">Active (In Progress)</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl">
               <p className="text-4xl font-black text-green-500 mb-1">{resolvedCount}</p>
               <p className="text-sm font-bold text-slate-200">Completed</p>
            </div>
         </div>
      </div>

      {/* DYNAMIC SECTOR LOAD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 bg-[#111418] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Activity size={18} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Sector Load Distribution</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.distribution.map((sector) => (
              <div key={sector.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{sector.name}</p>
                  <p className="text-white font-black text-xl">{sector.percentage}%</p>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-700 ease-out" 
                    style={{ width: `${sector.percentage}%` }}
                  />
                </div>
                <p className="text-slate-500 text-[10px] font-bold">
                  {sector.active}/{sector.total} Staff Active
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DYNAMIC TOTAL WORKFORCE SECTION */}
        <div className="bg-[#111418] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Workforce</p>
            <h2 className="text-7xl font-black text-white">{stats.totalWorkforce}</h2>
          </div>
          <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 w-fit px-3 py-1.5 rounded-lg">
            <Zap size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase">{pendingCount} Emergency Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};


/* --- SUB-VIEW 3: MAINTENANCE DASHBOARD (Personnel Directory) --- */
const MaintenanceView = ({ personnel, onRefresh }) => {
  // These MUST be defined inside MaintenanceView to avoid ReferenceErrors
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.assignedBlock.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Maintenance Dashboard</h2>
          <p className="text-slate-400 max-w-full">Manage deployments and track real-time availability of staff across campus.</p>
        </div>
      </div>

      {/* Personnel Directory Table */}
      <div className="bg-[#111418] border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Table Header/Filter */}
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0d1013]/50">
          <h3 className="text-xl font-bold text-white">Personnel Directory & Deployment</h3>
          <div className="flex gap-4">
            <div className="bg-[#05070A] border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-2 focus-within:border-blue-500/50 transition-all">
              <Search size={18} className="text-slate-500"/>
              <input 
                type="text" 
                placeholder="Filter by sector or block..." 
                className="bg-transparent outline-none text-sm w-64 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-[#05070A] p-3 rounded-xl text-slate-400 border border-slate-800 hover:text-white transition-colors">
              <Filter size={20}/>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border-b border-slate-800 bg-[#0d1013]/30">
                <tr>
                  <th className="p-8">Staff Name</th>
                  <th className="p-8">Sector</th>
                  <th className="p-8">Current Status</th>
                  <th className="p-8">Assigned Block</th>
                  <th className="p-8">Room/Floor</th>
                  <th className="p-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPersonnel.map((staff) => (
                  <tr key={staff._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-8 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 border-2 border-slate-700 text-slate-400 font-bold text-lg">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{staff.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{staff.staffId}</p>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-[10px] font-bold text-slate-400 uppercase">{staff.sector}</span>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${staff.currentStatus === 'Online' ? 'bg-blue-500 animate-pulse' : staff.currentStatus === 'Busy' ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                        <span className={`font-bold ${staff.currentStatus === 'Online' ? 'text-blue-500' : staff.currentStatus === 'Busy' ? 'text-red-500' : 'text-slate-500'}`}>{staff.currentStatus}</span>
                      </div>
                    </td>
                    <td className="p-8 text-sm text-slate-300 font-medium">{staff.assignedBlock}</td>
                    <td className="p-8 text-sm text-blue-500 font-mono flex items-center gap-2">
                      {staff.activeRoom ? (
                        <>
                          <MapPin size={12} className="text-blue-400" />
                          {staff.activeRoom}
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-8">
                      <button 
                        onClick={() => {
                          setSelectedStaff(staff);
                          setIsManualModalOpen(true);
                        }}
                        disabled={staff.currentStatus === 'Offline'}
                        className={`font-black uppercase tracking-widest text-[10px] ${staff.currentStatus === 'Offline' ? 'text-slate-600 cursor-not-allowed' : 'text-blue-500 hover:text-blue-400'}`}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RENDER MODAL HERE - Inside the component return */}
        {isManualModalOpen && selectedStaff && (
          <ManualAssignModal 
            staff={selectedStaff} 
            onClose={() => setIsManualModalOpen(false)} 
            onRefresh={onRefresh} 
          />
        )}
      </div>
    );
  };

const AssignmentModal = ({ request, personnel, onClose, onRefresh }) => {
  const [selectedWorker, setSelectedWorker] = useState('');

  const handleAssign = async () => {
  if (!selectedWorker) return alert("Please select a worker");
  try {
    await API.patch(`/requests/${request._id}/assign`, {
      workerId: selectedWorker,
      // Change 'block' to 'room' or 'activeRoom' to match your manual modal
      room: request.student?.roomNumber || 'Assigned Floor' 
    });
    onRefresh(); 
    onClose();
  } catch (err) {
    alert("Assignment failed");
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111418] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Deploy Staff</h2>
        <p className="text-slate-400 text-sm mb-6">Assign a worker to {request.category} at {request.student?.roomNumber}.</p>
        
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Available Personnel</label>
        <select 
          className="w-full bg-[#05070A] border border-slate-700 rounded-xl p-3 text-white mb-6 outline-none focus:border-blue-500 transition-all"
          onChange={(e) => setSelectedWorker(e.target.value)}
        >
          <option value="">Select an Online Worker...</option>
          {personnel
            .filter(p => p.currentStatus === 'Online' && p.sector.toLowerCase() === request.category.toLowerCase())
            .map(staff => (
              <option key={staff._id} value={staff._id}>
                {staff.name} — {staff.assignedBlock}
              </option>
            ))}
        </select>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={handleAssign}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SicDashboard;
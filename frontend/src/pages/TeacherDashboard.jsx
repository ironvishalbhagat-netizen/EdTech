import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Users, PlusCircle, BarChart3, LogOut, 
  Brain, Copy, ArrowLeft, Loader2, FileText, AlertCircle
} from 'lucide-react';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [batches, setBatches] = useState([]);
  
  // Create Batch States
  const [batchName, setBatchName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Assignment & Notice Form States
  const [assignmentData, setAssignmentData] = useState({ title: '', description: '', type: 'text', content: '', deadline: '' });
  const [file, setFile] = useState(null);
  const [noticeMsg, setNoticeMsg] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // Analytics States
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchAnalytics, setBatchAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const navigate = useNavigate();

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)).id;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchBatches();
  }, [navigate]);

  const fetchBatches = async () => {
    try {
      const userId = getUserId();
      const response = await axios.get(`http://localhost:5000/api/teacher/my-batches/${userId}`);
      setBatches(response.data);
    } catch (error) {
      toast.error("Error fetching batches");
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!batchName.trim()) return toast.error("Batch Name is required!");
    setIsCreating(true);
    try {
      const userId = getUserId();
      const res = await axios.post('http://localhost:5000/api/teacher/create-batch', {
        batchName,
        description,
        teacherId: userId
      });
      setBatches([...batches, res.data.batch]);
      setBatchName('');
      setDescription('');
      toast.success(`Batch Created! Code: ${res.data.batch.batchCode}`);
      setActiveTab('manage');
    } catch (error) {
      toast.error('Error creating batch');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadAssignment = async (e) => {
    e.preventDefault();
    if(!selectedBatchId) return toast.error("Please select a batch first!");
    const formData = new FormData();
    formData.append('batchId', selectedBatchId);
    formData.append('title', assignmentData.title);
    formData.append('description', assignmentData.description);
    formData.append('type', assignmentData.type);
    formData.append('content', assignmentData.content);
    if (file) formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/teacher/upload-assignment', formData);
      toast.success("Assignment uploaded successfully!");
      setAssignmentData({ title: '', description: '', type: 'text', content: '', deadline: '' });
      setFile(null);
    } catch (error) { toast.error("Error uploading assignment"); }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if(!selectedBatchId) return toast.error("Please select a batch first!");
    try {
      await axios.post('http://localhost:5000/api/teacher/post-notice', {
        batchId: selectedBatchId,
        message: noticeMsg
      });
      toast.success("Notice posted successfully!");
      setNoticeMsg('');
    } catch (error) { toast.error("Error posting notice"); }
  };

  const loadBatchAnalytics = async (batch) => {
    setSelectedBatch(batch);
    setIsLoadingAnalytics(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/batch-analytics/${batch._id}`);
      setBatchAnalytics(res.data);
    } catch (error) {
      toast.error('Error loading analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Batch Code copied!");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'create', label: 'Create Batch', icon: <PlusCircle size={20} /> },
    { id: 'manage', label: 'Manage Batches', icon: <Users size={20} /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={20} /> },
    { id: 'notices', label: 'Notice Board', icon: <AlertCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-indigo-50">
            <h1 className="text-xl font-bold text-indigo-700 flex items-center">
              <Brain className="mr-2" size={24} /> Teacher Panel
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedBatch(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id && !selectedBatch
                    ? 'bg-indigo-600 text-white font-medium' 
                    : 'text-gray-600 hover:bg-indigo-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-center text-gray-400 mb-4 font-medium uppercase tracking-wider">
            Built by Team CSK
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && !selectedBatch && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium mb-1">Total Active Batches</p>
                  <h3 className="text-4xl font-bold text-indigo-600">{batches.length}</h3>
                </div>
                <div className="p-4 bg-indigo-50 rounded-full text-indigo-600"><Users size={32}/></div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium mb-1">Total Enrolled Students</p>
                  <h3 className="text-4xl font-bold text-green-600">
                    {batches.reduce((acc, curr) => acc + curr.students.length, 0)}
                  </h3>
                </div>
                <div className="p-4 bg-green-50 rounded-full text-green-600"><BarChart3 size={32}/></div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE BATCH TAB */}
        {activeTab === 'create' && !selectedBatch && (
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Batch</h2>
            <form onSubmit={handleCreateBatch} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                  <input type="text" required value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Complete React Bootcamp 2026" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" rows="3" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <button type="submit" disabled={isCreating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center">
                  {isCreating ? <Loader2 className="animate-spin mr-2"/> : <PlusCircle className="mr-2"/>}
                  Generate Batch & Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MANAGE BATCHES TAB */}
        {activeTab === 'manage' && !selectedBatch && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Batches</h2>
            {batches.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">You haven't created any batches yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                  <div key={batch._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-800 mb-2">{batch.batchName}</h3>
                      <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-100">
                        Code: {batch.batchCode}
                        <button onClick={() => copyToClipboard(batch.batchCode)} className="ml-2"><Copy size={14}/></button>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 bg-slate-50 p-4 flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium flex items-center"><Users size={16} className="mr-2"/> {batch.students.length} Students</span>
                      <button onClick={() => loadBatchAnalytics(batch)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">View Analytics &rarr;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENT TAB */}
        {activeTab === 'assignments' && !selectedBatch && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Upload Assignment</h2>
            <form onSubmit={handleUploadAssignment} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <select onChange={(e) => setSelectedBatchId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg">
                <option value="">-- Select Batch --</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
              </select>
              <input type="text" placeholder="Title" value={assignmentData.title} onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required />
              <textarea placeholder="Description" value={assignmentData.description} onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required></textarea>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
              <button type="submit" className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold">Upload Assignment</button>
            </form>
          </div>
        )}

        {/* NOTICE BOARD TAB */}
        {activeTab === 'notices' && !selectedBatch && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Post Notice</h2>
            <form onSubmit={handlePostNotice} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <select onChange={(e) => setSelectedBatchId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg">
                <option value="">-- Select Batch --</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
              </select>
              <textarea placeholder="Write announcement here..." value={noticeMsg} onChange={(e) => setNoticeMsg(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required></textarea>
              <button type="submit" className="bg-orange-500 text-white py-3 px-6 rounded-lg font-bold">Post Notice</button>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* MISSING BATCH ANALYTICS VIEW IS BACK HERE */}
        {/* ========================================= */}
        {selectedBatch && (
          <div>
            <button onClick={() => setSelectedBatch(null)} className="mb-6 flex items-center text-indigo-600 font-medium hover:text-indigo-800">
              <ArrowLeft size={18} className="mr-2" /> Back to Batches
            </button>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{selectedBatch.batchName}</h2>
                <p className="text-gray-500 mt-1">Batch Code: <span className="font-bold text-indigo-600">{selectedBatch.batchCode}</span></p>
              </div>
            </div>

            {isLoadingAnalytics ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>
            ) : batchAnalytics?.students?.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-semibold text-gray-700">Student Name</th>
                      <th className="p-4 font-semibold text-gray-700">Email</th>
                      <th className="p-4 font-semibold text-gray-700">Roadmaps Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchAnalytics.students.map((data, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-gray-800">{data.studentDetails?.name || 'Unknown'}</td>
                        <td className="p-4 text-gray-500">{data.studentDetails?.email || 'N/A'}</td>
                        <td className="p-4 text-indigo-600 font-bold">{data.roadmaps?.length || 0} Roadmaps</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                No students have joined this batch yet. Share the code <b>{selectedBatch.batchCode}</b> with your students.
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default TeacherDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { 
  LayoutDashboard, BookOpen, Target, FileText, Settings, LogOut, 
  CheckCircle2, AlertCircle, ArrowRight, Brain, Sparkles, Loader2, 
  ArrowLeft, Trash2, Download, PlayCircle, Lock, User, Shield, CheckSquare, Square,
  Users // <-- Naya icon add kiya
} from 'lucide-react';

// DUMMY COURSE DATA
const courseModules = [
  { id: 1, title: "1. Introduction to Web Development", duration: "10:25", completed: true, locked: false, videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk" },
  { id: 2, title: "2. JavaScript Fundamentals", duration: "15:30", completed: false, locked: false, videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c" },
  { id: 3, title: "3. React Hooks Masterclass", duration: "22:15", completed: false, locked: true, videoUrl: "" },
  { id: 4, title: "4. Database Normalization", duration: "18:00", completed: false, locked: true, videoUrl: "" }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [roadmapData, setRoadmapData] = useState(null);

  // NAYE: AI Roadmap Search & Quiz States
  const [roadmapStep, setRoadmapStep] = useState('search'); 
  const [searchTopic, setSearchTopic] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  
  // Notes States
  const [notes, setNotes] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Course State
  const [activeVideo, setActiveVideo] = useState(courseModules[0]);

  // Settings & Join Batch States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // NAYA STATE: Join Batch ke liye
  const [joinBatchCode, setJoinBatchCode] = useState('');

  // NAYE STATES: Classroom Data ke liye
  const [classData, setClassData] = useState({ assignments: [], notices: [] });
  const [loadingClass, setLoadingClass] = useState(false);
  const [myBatches, setMyBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const navigate = useNavigate();

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)).id;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    // App Load hone par saara data fetch karein (Including Batches)
    const fetchAllData = async () => {
      try {
        const [profileRes, roadmapRes, notesRes, batchesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/profile/${userId}`),
          axios.get(`http://localhost:5000/api/assessment/get-all-roadmaps/${userId}`),
          axios.get(`http://localhost:5000/api/notes/${userId}`),
          axios.get(`http://localhost:5000/api/teacher/student-batches/${userId}`)
        ]);
        
        setProfileName(profileRes.data.name);
        setProfileEmail(profileRes.data.email);
        setSavedRoadmaps(roadmapRes.data);
        setNotes(notesRes.data);
        setMyBatches(batchesRes.data);

      } catch (error) { console.log("Error fetching dashboard data"); }
    };

    fetchAllData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // NAYA FUNCTION: Fetch Classroom Data
  const fetchClassroomData = async (batchId) => {
    if(!batchId) return;
    setLoadingClass(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/batch-data/${batchId}`);
      setClassData(res.data);
    } catch (error) { 
      toast.error("Error fetching class data"); 
    } finally { 
      setLoadingClass(false); 
    }
  };

  // NAYA FUNCTION: Join Batch
  const handleJoinBatch = async (e) => {
    e.preventDefault();
    if (!joinBatchCode.trim()) return toast.error("Please enter a batch code!");
    try {
      const userId = getUserId();
      const res = await axios.post('http://localhost:5000/api/teacher/join-batch', {
        batchCode: joinBatchCode,
        studentId: userId
      });
      toast.success(res.data.message || `Successfully joined ${res.data.batchName}!`);
      
      if (res.data.batchId) {
          const newBatch = { _id: res.data.batchId, batchName: res.data.batchName };
          setMyBatches([...myBatches, newBatch]);
          setSelectedBatchId(res.data.batchId);
          fetchClassroomData(res.data.batchId);
          setActiveTab('classroom');
      }

      setJoinBatchCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error joining batch');
    }
  };

  // AI Roadmap Generator Functions
  const handleSearchRoadmap = async () => {
    if (!searchTopic.trim()) return toast.error("Please enter a course or topic name!");
    setIsGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/assessment/generate-quiz', { topic: searchTopic });
      setQuiz(res.data.quiz);
      setRoadmapStep('quiz');
    } catch (error) {
      toast.error('Error fetching quiz. Generating dummy quiz for demo.');
      setQuiz([
        { question: `What is the core concept of ${searchTopic}?`, options: ["Option A", "Option B", "Option C", "Option D"] },
        { question: `Which tool is best for ${searchTopic}?`, options: ["Tool 1", "Tool 2", "Tool 3", "Tool 4"] }
      ]);
      setRoadmapStep('quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/assessment/submit-quiz', { 
        userId: getUserId(), 
        answers, 
        topic: searchTopic 
      });
      setSavedRoadmaps([res.data.roadmap, ...savedRoadmaps]);
      setRoadmapStep('search');
      setSearchTopic('');
      setAnswers({});
      toast.success('AI Roadmap Generated Successfully!');
    } catch (error) {
      toast.error('Error generating roadmap. Making dummy card for demo.');
      const dummyRoadmap = {
        _id: Date.now().toString(),
        topic: searchTopic,
        content: `Day 1-5: Basics of ${searchTopic}\nDay 6-15: Advanced Concepts\nDay 16-30: Build 3 Real-world Projects.`
      };
      setSavedRoadmaps([dummyRoadmap, ...savedRoadmaps]);
      setRoadmapStep('search');
      setSearchTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteRoadmapCard = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this roadmap?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/assessment/delete-roadmap/${id}`);
      setSavedRoadmaps(savedRoadmaps.filter(r => r._id !== id));
      if (selectedRoadmap?._id === id) setSelectedRoadmap(null);
      toast.success('Roadmap deleted!');
    } catch (error) {
      toast.error('Deleted (Demo mode)');
      setSavedRoadmaps(savedRoadmaps.filter(r => r._id !== id));
    }
  };

  const downloadRoadmapPDF = (e, roadmap) => {
    e.stopPropagation();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${roadmap.topic.toUpperCase()} ROADMAP`, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const content = roadmap.content || roadmap.dailyTasks?.[0]?.taskName || "Roadmap details missing.";
    const splitText = doc.splitTextToSize(content, pageWidth - 40);
    
    let yPosition = 35;
    for (let i = 0; i < splitText.length; i++) {
      if (yPosition > 280) { doc.addPage(); yPosition = 20; }
      doc.text(splitText[i], 20, yPosition);
      yPosition += 7;
    }
    doc.save(`${roadmap.topic.replace(/\s+/g, '_')}_Roadmap.pdf`);
    toast.success('Roadmap PDF Downloaded!');
  };

  const handleGenerateNote = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setIsGenerating(true);
    try {
      const userId = getUserId();
      const response = await axios.post('http://localhost:5000/api/notes/generate', {
        userId, topic: newTopic
      });
      setNotes([response.data.note, ...notes]);
      setNewTopic('');
      toast.success('AI Note Generated successfully!');
    } catch (error) {
      toast.error('Error generating note');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleNoteStatus = async (noteId, e) => {
    if(e) e.stopPropagation();
    try {
      const response = await axios.put(`http://localhost:5000/api/notes/toggle-status/${noteId}`);
      const updatedNote = response.data.note;
      setNotes(notes.map(note => note._id === noteId ? updatedNote : note));
      if (selectedNote && selectedNote._id === noteId) {
        setSelectedNote(updatedNote);
      }
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`);
      setNotes(notes.filter(note => note._id !== noteId));
      if(selectedNote?._id === noteId) setSelectedNote(null);
      toast.success('Note deleted successfully!');
    } catch (error) {
      toast.error('Error deleting note');
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedNote) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(selectedNote.topic, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(selectedNote.content, pageWidth - 40);
    let yPosition = 35;
    for (let i = 0; i < splitText.length; i++) {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(splitText[i], 20, yPosition);
      yPosition += 7;
    }
    doc.save(`${selectedNote.topic.replace(/\s+/g, '_')}_Notes.pdf`);
    toast.success('PDF Downloaded!');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const userId = getUserId();
      await axios.put(`http://localhost:5000/api/users/update/${userId}`, {
        name: profileName
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill both password fields');
      return;
    }
    try {
      const userId = getUserId();
      await axios.put(`http://localhost:5000/api/users/update/${userId}`, {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully!');
      setCurrentPassword(''); 
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'classroom', label: 'Classroom', icon: <Users size={20} /> },
    { id: 'roadmap', label: 'AI Roadmap', icon: <Target size={20} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { id: 'notes', label: 'AI Notes', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const totalNotes = notes.length;
  const completedNotes = notes.filter(n => n.isCompleted).length;
  const remainingNotes = totalNotes - completedNotes;

  const activeTabLabel = menuItems.find(item => item.id === activeTab)?.label;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-indigo-600 flex items-center">
              <Brain className="mr-2" size={24} /> Edtech Platform
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 capitalize">
            {activeTab === 'overview' ? `Welcome back, ${profileName ? profileName.split(' ')[0] : 'Student'}!` : activeTabLabel}
          </h2>
          <p className="text-gray-500 mt-1">Here is what's happening with your learning journey today.</p>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-gray-500 font-medium">Daily Streak</h3>
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">5 Days</p>
              </div>
              
              <div 
                onClick={() => setActiveTab('roadmap')}
                className="bg-indigo-600 p-6 rounded-xl shadow-sm text-white cursor-pointer hover:bg-indigo-700 transition-colors flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-indigo-100 font-medium">Current Goal</h3>
                  <Target className="text-indigo-200" size={24} />
                </div>
                <p className="text-xl font-bold flex items-center">
                  View AI Roadmap <ArrowRight className="ml-2" size={18} />
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-gray-500 font-medium">AI Notes Progress</h3>
                  <FileText className="text-indigo-500" size={24} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-center"><p className="text-2xl font-bold">{totalNotes}</p><p className="text-xs text-gray-400 uppercase font-semibold">Total</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-green-500">{completedNotes}</p><p className="text-xs text-gray-400 uppercase font-semibold">Done</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-orange-400">{remainingNotes}</p><p className="text-xs text-gray-400 uppercase font-semibold">Pending</p></div>
                </div>
              </div>
            </div>

            {/* Join Class/Batch */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <Users className="mr-2 text-indigo-600" size={24} /> Join a Teacher's Batch
              </h3>
              <p className="text-gray-500 mb-6">Enter the 6-digit code provided by your teacher to join their class.</p>
              
              <form onSubmit={handleJoinBatch} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <input 
                  type="text" 
                  value={joinBatchCode}
                  onChange={(e) => setJoinBatchCode(e.target.value.toUpperCase())}
                  placeholder="e.g. X9K2P1" 
                  maxLength={6}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase tracking-widest font-semibold"
                />
                <button 
                  type="submit" 
                  disabled={!joinBatchCode.trim() || joinBatchCode.length < 6}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Join Batch
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: CLASSROOM WITH DROPDOWN */}
        {activeTab === 'classroom' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">My Classroom</h2>
            
            {/* Batch Selection Dropdown */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select a Batch to view its content</label>
                <select 
                    value={selectedBatchId}
                    onChange={(e) => {
                        setSelectedBatchId(e.target.value);
                        fetchClassroomData(e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer"
                >
                    <option value="">-- Click to Select your Batch --</option>
                    {myBatches.map((batch) => (
                        <option key={batch._id} value={batch._id}>{batch.batchName}</option>
                    ))}
                </select>
                {myBatches.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">You haven't joined any batches yet. Go to Overview to join a batch.</p>
                )}
            </div>

            {/* Assignments & Notices Content */}
            {selectedBatchId && loadingClass ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>
            ) : selectedBatchId && !loadingClass ? (
                <>
                    {/* Notices Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold mb-4 text-orange-600 flex items-center"><AlertCircle className="mr-2"/> Notice Board</h3>
                      {classData.notices.length > 0 ? classData.notices.map((n, i) => (
                        <div key={i} className="p-4 bg-orange-50 mb-3 rounded-lg border border-orange-100">
                            <span className="block text-xs text-orange-400 font-bold mb-1 uppercase tracking-wider">{new Date(n.createdAt).toLocaleDateString()}</span>
                            <p className="text-gray-800 font-medium">{n.message}</p>
                        </div>
                      )) : <p className="text-gray-500 italic p-4 bg-slate-50 rounded">No new notices for this batch.</p>}
                    </div>

                    {/* Assignments Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold mb-4 text-indigo-600 flex items-center"><FileText className="mr-2"/> Assignments</h3>
                      {classData.assignments.length > 0 ? classData.assignments.map((a, i) => (
                        <div key={i} className="p-5 border border-gray-200 rounded-xl mb-4 bg-white shadow-sm hover:shadow transition-shadow">
                          <h4 className="font-bold text-lg text-gray-800 mb-1">{a.title}</h4>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded mb-3">Due: {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'No Deadline'}</span>
                          <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{a.description}</p>
                          
                          {a.fileUrl && (
                              <a 
                                href={`http://localhost:5000/${a.fileUrl.replace(/\\/g, '/')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                              >
                                <Download size={16} className="mr-2"/> Download Resource
                              </a>
                          )}
                        </div>
                      )) : <p className="text-gray-500 italic p-4 bg-slate-50 rounded">No assignments posted yet.</p>}
                    </div>
                </>
            ) : null}
          </div>
        )}

        {/* TAB 3: AI ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            {selectedRoadmap ? (
              <div className="relative">
                <button onClick={() => setSelectedRoadmap(null)} className="mb-6 flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                  <ArrowLeft size={18} className="mr-2" /> Back to Saved Roadmaps
                </button>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-800 capitalize">{selectedRoadmap.topic} Roadmap</h3>
                  <button onClick={(e) => downloadRoadmapPDF(e, selectedRoadmap)} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                    <Download size={18} className="mr-2" /> Download PDF
                  </button>
                </div>
                <div className="bg-slate-50 p-8 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedRoadmap.content || 'Roadmap content missing or not generated properly.'}
                </div>
              </div>
            ) : roadmapStep === 'search' ? (
              <div>
                <div className="text-center py-6 border-b border-gray-100 mb-8">
                  <Brain className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Generate Your Custom AI Roadmap</h3>
                  <p className="text-gray-500 mb-6">Search for any course or skill to take a diagnostic quiz.</p>
                  
                  <div className="flex max-w-2xl mx-auto gap-4">
                    <input 
                      type="text"
                      placeholder="e.g. Full Stack Web Development, Python..."
                      value={searchTopic}
                      onChange={(e) => setSearchTopic(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      disabled={isGenerating}
                    />
                    <button 
                      onClick={handleSearchRoadmap}
                      disabled={!searchTopic.trim() || isGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
                    >
                      {isGenerating ? <Loader2 className="animate-spin mr-2" size={20} /> : <Target className="mr-2" size={20} />}
                      Start Quiz
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Your Saved Roadmaps</h4>
                  {savedRoadmaps && savedRoadmaps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedRoadmaps.map((rm) => (
                        <div 
                          key={rm._id} 
                          onClick={() => setSelectedRoadmap(rm)} 
                          className="bg-slate-50 p-6 rounded-xl border border-gray-200 relative group flex flex-col justify-between h-48 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
                        >
                          <div>
                            <h5 className="font-bold text-lg text-indigo-700 mb-2 capitalize">{rm.topic}</h5>
                            <p className="text-gray-500 text-sm line-clamp-3">{rm.content || 'Click to view your detailed step-by-step learning path.'}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <button onClick={(e) => downloadRoadmapPDF(e, rm)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center z-10">
                              <Download size={16} className="mr-1" /> PDF
                            </button>
                            <button onClick={(e) => deleteRoadmapCard(e, rm._id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded transition-colors z-10" title="Delete Roadmap">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8 bg-slate-50 rounded-lg border border-dashed border-gray-200">
                      No roadmaps generated yet. Search above to create your first one!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    Assessment Quiz: <span className="text-indigo-600 ml-2 capitalize">{searchTopic}</span>
                  </h3>
                  <button onClick={() => setRoadmapStep('search')} className="text-gray-500 hover:text-gray-800 flex items-center font-medium">
                    <ArrowLeft size={18} className="mr-1" /> Cancel
                  </button>
                </div>
                
                <div className="space-y-6">
                  {quiz.map((q, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-lg border border-gray-100">
                      <p className="font-semibold text-gray-800 mb-4 text-lg">{i + 1}. {q.question}</p>
                      <div className="space-y-3 pl-2">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center space-x-3 cursor-pointer p-3 rounded hover:bg-white border border-transparent hover:border-gray-200 transition-colors">
                            <input 
                              type="radio" 
                              name={`question-${i}`} 
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                              onChange={() => setAnswers({...answers, [i]: opt})}
                            /> 
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSubmitQuiz} 
                    disabled={isGenerating}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center shadow-md"
                  >
                    {isGenerating ? <Loader2 className="animate-spin mr-2" size={20} /> : <Sparkles className="mr-2" size={20} />}
                    {isGenerating ? 'Generating Roadmap...' : 'Submit & Generate Roadmap'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY COURSES */}
        {activeTab === 'courses' && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-4">
              <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-md relative">
                {activeVideo.videoUrl ? (
                  <iframe 
                    className="w-full h-full"
                    src={activeVideo.videoUrl} 
                    title={activeVideo.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Lock size={48} className="mb-4" />
                    <p className="text-lg">This module is locked. Complete previous modules to unlock.</p>
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{activeVideo.title}</h3>
                <p className="text-gray-500">Instructor: AI Expert • Duration: {activeVideo.duration}</p>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 bg-slate-50">
                  <h3 className="font-bold text-gray-800 text-lg">Course Curriculum</h3>
                  <p className="text-sm text-gray-500 mt-1">25% Completed</p>
                </div>
                <div className="divide-y divide-gray-100 overflow-y-auto">
                  {courseModules.map((mod) => (
                    <button 
                      key={mod.id}
                      disabled={mod.locked}
                      onClick={() => setActiveVideo(mod)}
                      className={`w-full text-left p-4 flex items-center transition-colors ${
                        activeVideo.id === mod.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50 border-l-4 border-transparent'
                      } ${mod.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="mr-3">
                        {mod.completed ? (
                          <CheckCircle2 className="text-green-500" size={20} />
                        ) : mod.locked ? (
                          <Lock className="text-gray-400" size={20} />
                        ) : (
                          <PlayCircle className={activeVideo.id === mod.id ? 'text-indigo-600' : 'text-gray-400'} size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-medium text-sm ${activeVideo.id === mod.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {mod.title}
                        </h4>
                        <span className="text-xs text-gray-400">{mod.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {selectedNote ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
                {selectedNote.isCompleted && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-6 py-1.5 rounded-bl-xl z-10">COMPLETED</div>
                )}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <button onClick={() => setSelectedNote(null)} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={18} className="mr-2" /> Back to Notes List
                  </button>
                  <div className="flex space-x-3">
                    <button 
                        onClick={(e) => handleToggleNoteStatus(selectedNote._id, e)}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors border ${selectedNote.isCompleted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200'}`}
                    >
                        {selectedNote.isCompleted ? <CheckSquare size={18} className="mr-2"/> : <Square size={18} className="mr-2"/>}
                        {selectedNote.isCompleted ? 'Completed' : 'Mark as Complete'}
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors">
                      <Download size={18} className="mr-2" /> Download PDF
                    </button>
                    <button onClick={() => handleDeleteNote(selectedNote._id)} className="flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
                      <Trash2 size={18} className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedNote.topic}</h3>
                <div className="bg-slate-50 p-6 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNote.content}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Sparkles className="mr-2 text-indigo-600" size={20} /> Generate New Study Material
                  </h3>
                  <form onSubmit={handleGenerateNote} className="flex gap-4">
                    <input 
                      type="text" 
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="E.g. What is Database Normalization?" 
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      disabled={isGenerating}
                    />
                    <button 
                      type="submit" 
                      disabled={!newTopic.trim() || isGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center min-w-[140px] justify-center"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'Generate'}
                    </button>
                  </form>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note) => (
                    <div 
                      key={note._id} 
                      onClick={() => setSelectedNote(note)}
                      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all relative overflow-hidden h-48 flex flex-col justify-between"
                    >
                      {note.isCompleted && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">DONE</div>}
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">{note.topic}</h4>
                        <p className="text-gray-500 text-sm line-clamp-2">{note.content}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 border-t pt-2">
                        <button onClick={(e) => handleToggleNoteStatus(note._id, e)} className={`text-sm flex items-center ${note.isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {note.isCompleted ? <CheckSquare size={16} className="mr-1"/> : <Square size={16} className="mr-1"/>}
                            {note.isCompleted ? 'Done' : 'Mark Done'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id); }} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="mr-2 text-indigo-600" size={24} /> Profile Information
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={profileEmail} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500" disabled />
                  </div>
                </div>
                <div className="flex justify-end"><button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">Save Changes</button></div>
              </form>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Shield className="mr-2 text-indigo-600" size={24} /> Security & Password
              </h3>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-gray-200" />
                </div>
                <div className="flex justify-start"><button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium">Update Password</button></div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
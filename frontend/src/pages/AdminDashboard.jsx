import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../api/axios';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Users,
  Code2,
  Trophy,
  TrendingUp,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalUsers: 0,
    totalSubmissions: 0,
    activeUsers: 0
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
  try {
    setLoading(true);
    
    // ✅ Yeh change karo - "/problem/all"
    const problemsRes = await axios.get('http://localhost:3000/problem/all', {
      withCredentials: true
    });
    setProblems(problemsRes.data.problems || []);
    
    setStats(prev => ({
      ...prev,
      totalProblems: problemsRes.data.problems?.length || 0
    }));
    
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};

 const handleDeleteProblem = async () => {
  if (!selectedProblem) return;
  
  try {
    // ✅ Yeh URL use karo
    await axios.delete(`http://localhost:3000/problem/${selectedProblem._id}`, {
      withCredentials: true
    });
    
    setProblems(problems.filter(p => p._id !== selectedProblem._id));
    setShowDeleteModal(false);
    setSelectedProblem(null);
    setStats(prev => ({
      ...prev,
      totalProblems: prev.totalProblems - 1
    }));
    alert('✅ Problem deleted successfully!');
  } catch (error) {
    console.error('Error deleting problem:', error);
    alert(error.response?.data?.message || '❌ Failed to delete problem');
  }
};

  const handleEditProblem = (problemId) => {
    navigate(`/admin/edit-problem/${problemId}`);
  };

  const handleCreateProblem = () => {
    navigate('/admin/create-problem');
  };

  const handleViewProblem = (problemId) => {
    navigate(`/problem/${problemId}`);
  };

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(u =>
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Hard': return 'text-red-400 bg-red-500/10';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f0f23] px-4 md:px-6 py-3 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Code2 className="w-8 h-8 text-yellow-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                CodeHere
              </span>
            </div>
            <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              Admin Panel
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to Home
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
              {user?.firstName?.[0] || 'A'}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Total Problems</p>
                <p className="text-xl md:text-2xl font-bold">{stats.totalProblems}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Total Users</p>
                <p className="text-xl md:text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.activeUsers} active</p>
          </div>

          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Submissions</p>
                <p className="text-xl md:text-2xl font-bold">{stats.totalSubmissions}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Acceptance Rate</p>
                <p className="text-xl md:text-2xl font-bold">42%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#0f0f23] rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('problems')}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'problems'
                    ? 'text-white bg-blue-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Problems ({problems.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'text-white bg-green-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Users ({users.length})
              </button>
            </div>
            
            {activeTab === 'problems' && (
              <button
                onClick={handleCreateProblem}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <PlusCircle className="w-4 h-4" />
                Add New Problem
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="px-4 md:px-6 py-3 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={activeTab === 'problems' ? "Search problems by title or tag..." : "Search users by name or email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Content */}
          {activeTab === 'problems' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a2e]">
                  <tr className="text-left text-xs text-gray-400">
                    <th className="px-4 md:px-6 py-3">Title</th>
                    <th className="px-4 md:px-6 py-3 hidden sm:table-cell">Difficulty</th>
                    <th className="px-4 md:px-6 py-3 hidden md:table-cell">Tags</th>
                    <th className="px-4 md:px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                        No problems found
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((problem) => (
                      <tr
                        key={problem._id}
                        className="border-t border-gray-800 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <div className="text-sm text-blue-400">{problem.title}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {problem.tags?.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {problem.tags?.length > 2 && (
                              <span className="text-xs text-gray-500">+{problem.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewProblem(problem._id)}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProblem(problem._id)}
                              className="p-1.5 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProblem(problem);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a2e]">
                  <tr className="text-left text-xs text-gray-400">
                    <th className="px-4 md:px-6 py-3">User</th>
                    <th className="px-4 md:px-6 py-3 hidden sm:table-cell">Email</th>
                    <th className="px-4 md:px-6 py-3 hidden md:table-cell">Role</th>
                    <th className="px-4 md:px-6 py-3 text-right">Problems Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t border-gray-800 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                              {user.firstName?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="text-sm">{user.firstName} {user.lastName || ''}</div>
                              <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 hidden sm:table-cell text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-right text-gray-300">
                          {user.solvedProblems?.length || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a3e] rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Problem</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete "{selectedProblem?.title}"?
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProblem(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProblem}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
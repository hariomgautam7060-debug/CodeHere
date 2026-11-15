import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
  Search, 
  Code2, 
  Trophy, 
  TrendingUp,
  Clock,
  CheckCircle,
  Circle,
  Filter,
  LogOut,
  User,
  Settings,
  Loader2,
  Shield,
  PlusCircle
} from 'lucide-react';

const Homepage = () => {
  const { register, handleSubmit } = useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    solved: 0,
    total: 0,
    streak: 0,
    ranking: 0,
    acceptance: 0
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProblems();
    fetchUserStats();
    
    const handleProblemSolved = () => {
      fetchUserStats();
    };
    
    window.addEventListener('problemSolved', handleProblemSolved);
    
    return () => {
      window.removeEventListener('problemSolved', handleProblemSolved);
    };
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/problem/all', {
        withCredentials: true
      });
      setProblems(response.data.problems || []);
      setStats(prev => ({
        ...prev,
        total: response.data.problems?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching problems:', error);
      setProblems(getFallbackProblems());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // 1️⃣ Solved Problems
      const solvedRes = await axios.get('http://localhost:3000/problem/solvedproblembyuser', {
        withCredentials: true
      });
      
      const backendSolved = solvedRes.data.problemSolved || [];
      const localSolved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
      const uniqueLocal = [...new Set(localSolved)];
      const allSolved = [...new Set([...backendSolved.map(p => p._id || p), ...uniqueLocal])];
      const totalSolved = allSolved.length;
      
      // 2️⃣ Acceptance Rate (Dummy for now)
      let acceptanceRate = 0;
      try {
        const acceptanceRes = await axios.get('http://localhost:3000/submission/acceptance', {
          withCredentials: true
        });
        acceptanceRate = acceptanceRes.data.acceptanceRate || 0;
      } catch (error) {
        acceptanceRate = totalSolved > 0 ? Math.min(100, 70 + Math.floor(Math.random() * 30)) : 0;
      }
      
      // 3️⃣ Ranking (Dummy for now)
      let ranking = 0;
      try {
        const rankingRes = await axios.get('http://localhost:3000/user/ranking', {
          withCredentials: true
        });
        ranking = rankingRes.data.ranking || 0;
      } catch (error) {
        ranking = totalSolved > 0 ? Math.max(1, 100 - totalSolved * 2) : 0;
      }
      
      // 4️⃣ Streak (Dummy for now)
      let streak = 0;
      try {
        const streakRes = await axios.get('http://localhost:3000/submission/streak', {
          withCredentials: true
        });
        streak = streakRes.data.streak || 0;
      } catch (error) {
        streak = totalSolved > 0 ? Math.min(30, Math.floor(totalSolved / 2) + 1) : 0;
      }
      
      setStats(prev => ({
        ...prev,
        solved: totalSolved,
        acceptance: acceptanceRate,
        ranking: ranking,
        streak: streak
      }));
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      const localSolved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
      const uniqueSolved = [...new Set(localSolved)];
      setStats(prev => ({
        ...prev,
        solved: uniqueSolved.length,
        acceptance: 0,
        ranking: 0,
        streak: 0
      }));
    }
  };

  const getFallbackProblems = () => {
    return [
      { _id: '1', title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], acceptance: '45%' },
      { _id: '2', title: 'Add Two Numbers', difficulty: 'Medium', tags: ['Linked List', 'Math'], acceptance: '35%' },
      { _id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['String', 'Sliding Window'], acceptance: '31%' },
    ];
  };

  const onSubmit = (data) => {
    if (data.search) {
      const filtered = problems.filter(p => 
        p.title.toLowerCase().includes(data.search.toLowerCase())
      );
      setProblems(filtered);
    } else {
      fetchProblems();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/user/logout', {}, { withCredentials: true });
    } catch (error) {
      console.log('Logout API error:', error);
    }
    
    dispatch({ type: 'auth/logout' });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login', { replace: true });
    window.location.href = '/login';
  };

  const handleAdminPanel = () => {
    navigate('/admin/dashboard');
  };

  const handleAddProblem = () => {
    navigate('/admin/create-problem');
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problem/${problemId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return '';
    }
  };

  const getStatusIcon = (problem) => {
    const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
    const isSolved = problem.solvedByUser || solvedProblems.includes(problem._id);
    
    return isSolved 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <Circle className="w-4 h-4 text-gray-600" />;
  };

  const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
  const uniqueSolved = [...new Set(solvedProblems)];

  const solvedCount = problems.filter(p => {
    return p.solvedByUser || uniqueSolved.includes(p._id);
  }).length;

  const unsolvedCount = problems.length - solvedCount;

  const filteredProblems = problems.filter(problem => {
    const isSolved = problem.solvedByUser || uniqueSolved.includes(problem._id);
    
    if (activeTab === 'solved') return isSolved === true;
    if (activeTab === 'unsolved') return !isSolved;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f0f23] px-4 md:px-6 py-3 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="relative">
              <Code2 className="w-8 h-8 text-yellow-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              CodeHere
            </span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <form onSubmit={handleSubmit(onSubmit)} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                {...register('search')}
                placeholder="Search problems..."
                className="bg-[#1a1a3e] border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </form>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4 px-3 py-1.5 bg-[#1a1a3e] rounded-lg border border-gray-800">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">#{stats.ranking}</span>
                </div>
                <div className="w-px h-4 bg-gray-700"></div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">{stats.streak || 0}d</span>
                </div>
              </div>
              
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-blue-500/25 transition-all">
                  {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </button>
                
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1a3e] border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                      {user?.role || 'User'}
                    </span>
                  </div>
                  
                  <div className="p-2">
                    {/* ✅ Profile Button */}
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-700 my-1"></div>
                        <button 
                          onClick={handleAdminPanel}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </button>
                        <button 
                          onClick={handleAddProblem}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add New Problem
                        </button>
                      </>
                    )}
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Solved</p>
                <p className="text-xl md:text-2xl font-bold">{stats.solved}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.solved}/{stats.total} problems</p>
            <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.solved/stats.total)*100 : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Acceptance</p>
                <p className="text-xl md:text-2xl font-bold">{stats.acceptance || 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Streak</p>
                <p className="text-xl md:text-2xl font-bold">{stats.streak || 0} days</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f23] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Ranking</p>
                <p className="text-xl md:text-2xl font-bold">#{stats.ranking || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-[#0f0f23] rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('all')}
                className={`text-xs md:text-sm font-medium whitespace-nowrap transition-colors px-3 py-1 rounded-lg ${
                  activeTab === 'all' 
                    ? 'text-white bg-blue-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({problems.length})
              </button>
              <button 
                onClick={() => setActiveTab('solved')}
                className={`text-xs md:text-sm font-medium whitespace-nowrap transition-colors px-3 py-1 rounded-lg ${
                  activeTab === 'solved' 
                    ? 'text-white bg-green-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Solved ({solvedCount})
              </button>
              <button 
                onClick={() => setActiveTab('unsolved')}
                className={`text-xs md:text-sm font-medium whitespace-nowrap transition-colors px-3 py-1 rounded-lg ${
                  activeTab === 'unsolved' 
                    ? 'text-white bg-red-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Unsolved ({unsolvedCount})
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 sm:hidden flex gap-2">
                <input
                  {...register('search')}
                  placeholder="Search problems..."
                  className="flex-1 bg-[#1a1a3e] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </form>
              <button className="flex items-center gap-2 text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a2e]">
                <tr className="text-left text-xs text-gray-400">
                  <th className="px-4 md:px-6 py-3 w-12">Status</th>
                  <th className="px-4 md:px-6 py-3">Title</th>
                  <th className="px-4 md:px-6 py-3 hidden sm:table-cell">Difficulty</th>
                  <th className="px-4 md:px-6 py-3 hidden md:table-cell">Tags</th>
                  <th className="px-4 md:px-6 py-3 text-right">Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No problems found
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr 
                      key={problem._id}
                      onClick={() => handleProblemClick(problem._id)}
                      className="border-t border-gray-800 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-4 md:px-6 py-4">
                        {getStatusIcon(problem)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        {problem.title}
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
                      <td className="px-4 md:px-6 py-4 text-sm text-right text-gray-300">
                        {problem.acceptance || '0%'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
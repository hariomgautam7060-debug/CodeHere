import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import {
  ArrowLeft,
  User,
  Mail,
  Award,
  CheckCircle,
  Code2,
  Calendar,
  TrendingUp,
  Clock,
  Trophy,
  Loader2,
  Edit2,
  Save,
  X
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalSubmissions: 0,
    acceptanceRate: 0,
    streak: 0,
    ranking: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: '',
    company: '',
    location: '',
    github: '',
    linkedin: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // ✅ 1. Get solved problems from backend
      const solvedRes = await axios.get('http://localhost:3000/problem/solvedproblembyuser', {
        withCredentials: true
      });

      console.log('📦 Solved API Response:', solvedRes.data);

      // ✅ Handle different response structures
      let solved = [];
      if (solvedRes.data.problemSolved) {
        solved = solvedRes.data.problemSolved;
      } else if (solvedRes.data.data) {
        solved = solvedRes.data.data;
      } else if (Array.isArray(solvedRes.data)) {
        solved = solvedRes.data;
      }

      // ✅ If backend returns empty, check local storage
      if (solved.length === 0) {
        const localSolved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
        if (localSolved.length > 0) {
          // Fetch all problems to get details
          const allRes = await axios.get('http://localhost:3000/problem/all', {
            withCredentials: true
          });
          const allProblems = allRes.data.problems || [];
          solved = allProblems.filter(p => localSolved.includes(p._id));
        }
      }

      console.log('✅ Solved Problems:', solved);
      setSolvedProblems(solved);

      // ✅ 2. Calculate difficulty stats
      let easy = 0,
        medium = 0,
        hard = 0;
      solved.forEach(p => {
        const diff = p.difficulty || '';
        if (diff === 'Easy') easy++;
        else if (diff === 'Medium') medium++;
        else if (diff === 'Hard') hard++;
      });

      // If no difficulty info, put all in easy
      if (solved.length > 0 && easy === 0 && medium === 0 && hard === 0) {
        easy = solved.length;
      }

      // ✅ 3. Get submissions
      let submissionsData = [];
      let totalSub = 0;
      let accepted = 0;
      try {
        const subRes = await axios.get('http://localhost:3000/submission/my', {
          withCredentials: true
        });
        submissionsData = subRes.data.submissions || [];
        totalSub = submissionsData.length;
        accepted = submissionsData.filter(s => s.verdict === 'Accepted').length;
      } catch (e) {
        console.log('⚠️ Submissions API not available');
      }
      setSubmissions(submissionsData);

      const acceptanceRate = totalSub > 0 ? Math.round((accepted / totalSub) * 100) : 0;

      // ✅ 4. Get streak
      let streak = 0;
      try {
        const streakRes = await axios.get('http://localhost:3000/submission/streak', {
          withCredentials: true
        });
        streak = streakRes.data.streak || 0;
      } catch (e) {}

      // ✅ 5. Get ranking
      let ranking = 0;
      try {
        const rankingRes = await axios.get('http://localhost:3000/user/ranking', {
          withCredentials: true
        });
        ranking = rankingRes.data.ranking || 0;
      } catch (e) {}

      // ✅ Update all stats
      setStats({
        totalSolved: solved.length,
        totalSubmissions: totalSub,
        acceptanceRate: acceptanceRate,
        streak: streak,
        ranking: ranking,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard
      });

      console.log('📊 Final Stats:', {
        totalSolved: solved.length,
        easy,
        medium,
        hard,
        totalSub,
        acceptanceRate,
        streak,
        ranking
      });

    } catch (error) {
      console.error('❌ Error fetching profile data:', error);
      
      // ✅ Fallback: Local storage se lo
      const localSolved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
      if (localSolved.length > 0) {
        setSolvedProblems(localSolved.map(id => ({ _id: id, title: 'Problem', difficulty: 'Easy' })));
        setStats(prev => ({
          ...prev,
          totalSolved: localSolved.length,
          easySolved: localSolved.length
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put('http://localhost:3000/user/profile', profileData, {
        withCredentials: true
      });
      alert('✅ Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Failed to update profile');
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-gray-400 bg-gray-500/10';
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Hard': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getVerdictColor = (verdict) => {
    switch(verdict) {
      case 'Accepted': return 'text-green-400';
      case 'Wrong Answer': return 'text-red-400';
      case 'Runtime Error': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f0f23] px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Profile
            </span>
          </div>
          <Code2 className="w-8 h-8 text-yellow-400" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f0f23] rounded-xl border border-gray-800 p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold mb-4">
                  {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                {!isEditing ? (
                  <>
                    <h2 className="text-xl font-bold">
                      {user?.firstName} {user?.lastName || ''}
                    </h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <span className="mt-2 text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {user?.role || 'User'}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-3 mt-2">
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Last Name"
                    />
                    <input
                      type="text"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Bio"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-lg">
                  <span className="text-sm text-gray-400">Problems Solved</span>
                  <span className="font-bold text-green-400">{stats.totalSolved}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-lg">
                  <span className="text-sm text-gray-400">Submissions</span>
                  <span className="font-bold text-blue-400">{stats.totalSubmissions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-lg">
                  <span className="text-sm text-gray-400">Acceptance Rate</span>
                  <span className="font-bold text-purple-400">{stats.acceptanceRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-lg">
                  <span className="text-sm text-gray-400">Streak</span>
                  <span className="font-bold text-orange-400">{stats.streak} days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-lg">
                  <span className="text-sm text-gray-400">Global Ranking</span>
                  <span className="font-bold text-yellow-400">#{stats.ranking}</span>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="mt-6 p-4 bg-[#1a1a3e] rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Solved by Difficulty</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-400">Easy</span>
                    <span className="text-sm font-medium">{stats.easySolved}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.totalSolved > 0 ? (stats.easySolved/stats.totalSolved)*100 : 0}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-400">Medium</span>
                    <span className="text-sm font-medium">{stats.mediumSolved}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${stats.totalSolved > 0 ? (stats.mediumSolved/stats.totalSolved)*100 : 0}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-400">Hard</span>
                    <span className="text-sm font-medium">{stats.hardSolved}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.totalSolved > 0 ? (stats.hardSolved/stats.totalSolved)*100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Solved Problems */}
            <div className="bg-[#0f0f23] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold">Solved Problems ({stats.totalSolved})</h3>
              </div>
              {solvedProblems.length === 0 ? (
                <p className="text-gray-400 text-sm">No problems solved yet. Start coding!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {solvedProblems.map((p, index) => (
                    <span
                      key={index}
                      className={`text-xs px-3 py-1 rounded-full ${getDifficultyColor(p.difficulty)} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => navigate(`/problem/${p._id}`)}
                    >
                      {p.title || p._id || 'Unknown'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="bg-[#0f0f23] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
              </div>
              {submissions.length === 0 ? (
                <p className="text-gray-400 text-sm">No submissions yet.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {submissions.slice(0, 10).map((sub, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${getVerdictColor(sub.verdict || sub.status)}`}>
                          {sub.verdict || sub.status || 'Pending'}
                        </span>
                        <span className="text-sm text-gray-300">{sub.problem?.title || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{sub.language || 'JS'}</span>
                        <span>{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
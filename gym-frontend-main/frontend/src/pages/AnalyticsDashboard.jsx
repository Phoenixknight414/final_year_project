import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Activity,
  TrendingUp,
  Calendar,
  Flame,
  Target,
  Clock,
  Award
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />

      {/* Main Dashboard Card - Transparent */}
      <div className="relative z-10 w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <div className="w-8"></div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6 mb-6">
          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Workouts This Month */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-6 border border-blue-700/30 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-semibold">+3</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">12</div>
              <div className="text-slate-400 text-sm">This month</div>
            </div>

            {/* Calories Burned */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-2xl p-6 border border-purple-700/30 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-semibold">+1.2k</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">8.4k</div>
              <div className="text-slate-400 text-sm">Burned this week</div>
            </div>

            {/* Day Streak */}
            <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 rounded-2xl p-6 border border-pink-700/30 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-pink-400 text-sm font-semibold">Best!</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">7</div>
              <div className="text-slate-400 text-sm">Day streak</div>
            </div>

            {/* Completion */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 rounded-2xl p-6 border border-cyan-700/30 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-sm font-semibold">+5%</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">68%</div>
              <div className="text-slate-400 text-sm">Completion</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Talk to Coach */}
            <button
              onClick={() => navigate('/trainer')}
              className="w-full bg-slate-800/50 hover:bg-slate-800/70 rounded-2xl p-5 border border-slate-700/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center relative">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">Talk to Coach</div>
                    <div className="text-slate-400 text-sm">Voice-powered AI guidance</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>

            {/* Custom Session */}
            <button
              onClick={() => navigate('/live-workout')}
              className="w-full bg-slate-800/50 hover:bg-slate-800/70 rounded-2xl p-5 border border-slate-700/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">Custom Session</div>
                    <div className="text-slate-400 text-sm">Camera-based workout tracking</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-bold text-white">Weekly Activity</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-400 text-sm">Calories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-slate-400 text-sm">Duration</span>
              </div>
            </div>
          </div>

          {/* Chart Area - Placeholder */}
          <div className="relative h-64 bg-slate-800/30 rounded-xl p-4">
            <div className="absolute inset-0 flex items-end justify-around p-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.random() * 150 + 50}px` }}
                    ></div>
                  </div>
                  <span className="text-slate-400 text-xs">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

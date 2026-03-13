import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('Dashboard fetched user data:', data);
        console.log('Profile image in data:', data.data?.profileImage ? 'YES' : 'NO');
        if (data.success) {
          setUserData(data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch recent workout sessions
    const fetchRecentWorkouts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/workout/sessions/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setRecentWorkouts(data.data);
        }
      } catch (error) {
        console.error('Error fetching recent workouts:', error);
      }
    };

    fetchUserData();
    fetchRecentWorkouts();
  }, [navigate, location]);

  // Refetch data when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:5000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUserData(data.data);
        })
        .catch(err => console.error(err));
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Exercise icon mapping
  const getExerciseIcon = (exerciseName) => {
    const iconMap = {
      'Bicep Curl': '💪',
      'Hammer Curl': '🔨',
      'Push-ups': '🤸',
      'Chest Fly': '🦅',
      'Lateral Raises': '🙆',
      'Front Raises': '🙋',
      'Squats': '🏋️',
      'Lunges': '🦵'
    };
    return iconMap[exerciseName] || '💪';
  };

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const workoutDate = new Date(date);
    const diffInMs = now - workoutDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffInDays}d ago`;
    }
  };

  // Format duration from seconds to minutes
  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <>
      <AnimatedBackground />
      
      {/* Fixed Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">GYM</span>
              <span className="text-blue-400">eye</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hover:bg-blue-600 transition-colors overflow-hidden ring-4 ring-violet-500/40"
            >
              {userData?.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                userData?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </button>
          </div>
        </div>
      </header>
      
      <div className="min-h-screen flex flex-col relative pt-[73px]">
        {/* Main Content */}
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pt-4 pb-6">
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
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6 mb-6">
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

        {/* Progress Section */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Progress</h2>
          </div>

          <div className="space-y-6">
            {/* Weight Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Weight Goal</span>
                <span className="text-white font-semibold">72 → 68 kg</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Workouts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Workouts</span>
                <span className="text-white font-semibold">12 / 20</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Calorie Target */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Calorie Target</span>
                <span className="text-white font-semibold">85% avg</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* This Week Section */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">This Week</h2>
            </div>
            <span className="text-slate-400 text-sm">3/7 completed</span>
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 mb-6">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <button
                key={index}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  index === 3
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Workout List */}
          <div className="space-y-3">
            {/* Chest & Triceps - Completed */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-medium">Chest & Triceps</span>
              </div>
              <span className="text-slate-400 text-sm">Monday</span>
            </div>

            {/* Back & Biceps - Completed */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-medium">Back & Biceps</span>
              </div>
              <span className="text-slate-400 text-sm">Tuesday</span>
            </div>

            {/* Rest - Completed */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-medium">Rest</span>
              </div>
              <span className="text-slate-400 text-sm">Wednesday</span>
            </div>

            {/* Legs - Today */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-600">
                </div>
                <span className="text-white font-medium">Legs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Thursday</span>
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md font-medium">
                  TODAY
                </span>
              </div>
            </div>

            {/* HIIT - Upcoming */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-600">
                </div>
                <span className="text-slate-400 font-medium">HIIT</span>
              </div>
              <span className="text-slate-400 text-sm">Friday</span>
            </div>

            {/* Full Body - Upcoming */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-600">
                </div>
                <span className="text-slate-400 font-medium">Full Body</span>
              </div>
              <span className="text-slate-400 text-sm">Saturday</span>
            </div>

            {/* Rest - Upcoming */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-600">
                </div>
                <span className="text-slate-400 font-medium">Rest</span>
              </div>
              <span className="text-slate-400 text-sm">Sunday</span>
            </div>
          </div>
        </div>

        {/* Recent Workouts Section */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Recent</h2>
          </div>

          <div className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getExerciseIcon(workout.exerciseName)}</div>
                    <div>
                      <div className="text-white font-semibold">{workout.exerciseName}</div>
                      <div className="flex items-center gap-3 text-slate-400 text-sm mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDuration(workout.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{workout.calories}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">{getTimeAgo(workout.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent workouts yet</p>
                <p className="text-xs mt-1">Start a workout to see it here!</p>
              </div>
            )}
          </div>
        </div>
        </main>

        {/* Footer - Full width at the end */}
        <footer className="relative z-10 w-full bg-slate-900/95 backdrop-blur-xl shadow-2xl border-t border-slate-700/50 h-8">
        </footer>
      </div>
    </>
  );
};

export default AnalyticsDashboard;

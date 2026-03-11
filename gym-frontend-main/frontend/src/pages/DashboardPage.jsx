import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Flame, 
  Zap, 
  Target, 
  Mic, 
  Bell, 
  Settings, 
  LogOut,
  Calendar,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('T');

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
        if (data.success) {
          setUserData(data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const stats = [
    { icon: Dumbbell, value: '12', label: 'This month', change: '+3', color: 'from-blue-500 to-blue-600' },
    { icon: Flame, value: '8.4k', label: 'Burned this week', change: '+1.2k', color: 'from-purple-500 to-purple-600' },
    { icon: Zap, value: '7', label: 'Day streak', badge: 'Best!', color: 'from-pink-500 to-pink-600' },
    { icon: Target, value: '68%', label: 'Completion', change: '+5%', color: 'from-blue-600 to-blue-700' }
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  const weekWorkouts = [
    { name: 'Chest & Triceps', day: 'Monday', completed: true },
    { name: 'Back & Biceps', day: 'Tuesday', completed: true },
    { name: 'Rest', day: 'Wednesday', completed: true },
    { name: 'Legs', day: 'Thursday', completed: false, today: true },
    { name: 'HIIT', day: 'Friday', completed: false },
    { name: 'Full Body', day: 'Saturday', completed: false },
    { name: 'Rest', day: 'Sunday', completed: false }
  ];

  const recentWorkouts = [
    { name: 'Upper Body Strength', icon: '💪', duration: '45 min', calories: 320, time: 'Today' },
    { name: 'HIIT Cardio Blast', icon: '🔥', duration: '30 min', calories: 410, time: 'Yesterday' },
    { name: 'Leg Day Power', icon: '🦵', duration: '50 min', calories: 380, time: '2d ago' },
    { name: 'Core & Flexibility', icon: '🧘', duration: '35 min', calories: 220, time: '3d ago' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">GYM</span>
              <span className="text-blue-400">eye</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-400 text-sm mb-1">Good afternoon</p>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              Welcome back <span className="text-4xl">👋</span>
            </h1>
          </div>
          <button 
            onClick={() => navigate('/trainer')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Mic className="w-5 h-5" />
            Talk to Coach
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className="text-blue-400 text-sm font-medium">{stat.change}</span>
                )}
                {stat.badge && (
                  <span className="text-blue-400 text-sm font-medium">{stat.badge}</span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Coach Card */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                <Mic className="w-8 h-8 text-white" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">AI Fitness Coach</h3>
                <p className="text-slate-400 text-sm">Voice-powered diet plans, workout routines & real-time guidance</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/live-workout')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              Start Session
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* This Week & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* This Week */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">This Week</h2>
              </div>
              <span className="text-slate-400 text-sm">3/7 completed</span>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 mb-6">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    selectedDay === day || (index === 3 && selectedDay === 'T')
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
              {weekWorkouts.map((workout, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                    workout.today 
                      ? 'bg-blue-500/10 border border-blue-500/30' 
                      : 'bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      workout.completed 
                        ? 'bg-blue-500' 
                        : 'border-2 border-slate-600'
                    }`}>
                      {workout.completed && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white font-medium">{workout.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">{workout.day}</span>
                    {workout.today && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md font-medium">
                        TODAY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress & Recent */}
          <div className="space-y-8">
            {/* Progress */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Progress</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Weight Goal</span>
                    <span className="text-white font-semibold">72 — 68 kg</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Workouts</span>
                    <span className="text-white font-semibold">12 / 20</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Calorie Target</span>
                    <span className="text-white font-semibold">85% avg</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Recent</h2>
              </div>

              <div className="space-y-3">
                {recentWorkouts.map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{workout.icon}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{workout.name}</div>
                        <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {workout.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {workout.calories}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">{workout.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

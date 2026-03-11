import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slideDirection, setSlideDirection] = useState('forward');
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    fitnessGoal: ''
  });

  const totalSteps = 3;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleGoalSelect = (goal) => {
    setFormData({ ...formData, fitnessGoal: goal });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setSlideDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSlideDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({
          ...user,
          profileCompleted: true
        }));
        
        navigate('/dashboard');
      } else {
        setError(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Profile setup error:', err);
      setError('Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fitnessGoals = [
    { value: 'Weight Loss', icon: '📉', description: 'Reduce overall body weight' },
    { value: 'Weight Gain', icon: '📈', description: 'Increase healthy body mass' },
    { value: 'Fat Loss', icon: '🔥', description: 'Reduce body fat percentage' },
    { value: 'Muscle Building', icon: '💪', description: 'Build lean muscle mass' },
    { value: 'General Fitness', icon: '🎯', description: 'Improve overall health' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-gradient-drift"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-gradient-drift" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="backdrop-blur-2xl bg-slate-900/95 border border-slate-700/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 animate-scale-in w-[600px] max-w-full overflow-hidden">
          
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1 text-white">Set Up Your Profile</h1>
          <p className="text-slate-400 text-center mb-5 text-sm">Tell us about yourself so we can personalize your fitness journey</p>

          <div className="flex justify-center gap-2 mb-5">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  step === currentStep ? 'w-8 bg-blue-500' : step < currentStep ? 'w-2 bg-blue-500' : 'w-2 bg-slate-700'
                }`}
              ></div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-red-400 text-xs mb-4 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="overflow-x-hidden">
            <div className="min-h-[380px] relative overflow-hidden">
              <div className={`absolute inset-0 transition-all duration-500 ease-out ${
                currentStep === 1 
                  ? 'opacity-100 translate-x-0 pointer-events-auto' 
                  : slideDirection === 'forward'
                  ? 'opacity-0 -translate-x-8 pointer-events-none'
                  : 'opacity-0 translate-x-8 pointer-events-none'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Basic Information</h2>
                      <p className="text-xs text-slate-400">Let's start with the basics</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      placeholder="Enter your name"
                      required
                      disabled={currentStep !== 1}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        placeholder="25"
                        min="1"
                        max="120"
                        required
                        disabled={currentStep !== 1}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['Male', 'Female', 'Other'].map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => handleGenderSelect(gender)}
                            disabled={currentStep !== 1}
                            className={`px-2 py-2 text-xs rounded-lg font-medium transition-all duration-300 ${
                              formData.gender === gender
                                ? 'bg-blue-600 text-white scale-105'
                                : 'bg-slate-950/60 text-slate-400 border border-slate-700/40 hover:border-slate-600 hover:scale-105'
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`absolute inset-0 transition-all duration-500 ease-out ${
                currentStep === 2 
                  ? 'opacity-100 translate-x-0 pointer-events-auto' 
                  : currentStep < 2
                  ? 'opacity-0 translate-x-8 pointer-events-none'
                  : 'opacity-0 -translate-x-8 pointer-events-none'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Physical Stats</h2>
                      <p className="text-xs text-slate-400">Help us understand your current state</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        placeholder="170"
                        min="1"
                        step="0.1"
                        required
                        disabled={currentStep !== 2}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        placeholder="70"
                        min="1"
                        step="0.1"
                        required
                        disabled={currentStep !== 2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Weight (kg) - Optional</label>
                    <input
                      type="number"
                      name="targetWeight"
                      value={formData.targetWeight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      placeholder="65"
                      min="1"
                      step="0.1"
                      disabled={currentStep !== 2}
                    />
                  </div>
                </div>
              </div>

              <div className={`absolute inset-0 transition-all duration-500 ease-out ${
                currentStep === 3 
                  ? 'opacity-100 translate-x-0 pointer-events-auto' 
                  : 'opacity-0 translate-x-8 pointer-events-none'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Fitness Goal</h2>
                      <p className="text-xs text-slate-400">What do you want to achieve?</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {fitnessGoals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => handleGoalSelect(goal.value)}
                        disabled={currentStep !== 3}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                          formData.fitnessGoal === goal.value
                            ? 'bg-blue-600 border-2 border-blue-500 scale-[1.02]'
                            : 'bg-slate-950/60 border-2 border-slate-700/40 hover:border-slate-600 hover:scale-[1.01]'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 transition-all duration-300 ${
                          formData.fitnessGoal === goal.value ? 'bg-blue-700' : 'bg-slate-800'
                        }`}>
                          {goal.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-sm text-white">{goal.value}</div>
                          <div className="text-xs text-slate-400">{goal.description}</div>
                        </div>
                        {formData.fitnessGoal === goal.value && (
                          <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-4 py-2.5 text-sm bg-slate-950/60 border border-slate-700/40 rounded-lg font-semibold text-white hover:border-slate-600 transition-all duration-300"
                >
                  ← Back
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!formData.fullName || !formData.age || !formData.gender)) ||
                    (currentStep === 2 && (!formData.height || !formData.weight))
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-2.5 text-sm rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !formData.fitnessGoal}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2.5 text-sm rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  {loading ? 'Saving...' : 'Complete Setup ✓'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

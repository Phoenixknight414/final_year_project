import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { Link } from 'react-router-dom';

export default function PersonalizedWorkoutsComponent() {
  const [leftRef, leftVisible] = useScrollReveal({ threshold: 0.2 });
  const [rightRef, rightVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <section id="features" className="py-32 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-gradient-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-gradient-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Text Content with premium scroll reveal */}
          <div ref={leftRef} className={`md:pl-8 scroll-reveal-left ${leftVisible ? 'is-visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950/50 border border-blue-800/50 rounded-full text-blue-400 text-sm mb-8 backdrop-blur-sm">
              AI Fitness & Health App
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight">
              <span className="text-white">Personalized</span><br />
              <span className="text-white">Workouts</span><br />
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">Powered by AI</span>
            </h2>

            <div className="space-y-4 mb-12">
              {['Free Guided Workouts', 'Smart Progress Tracking', 'AI-Based Workout Plans', 'Real-time Form Correction'].map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 transition-all duration-300 hover:translate-x-2" 
                  style={{transitionDelay: `${idx * 0.1}s`}}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-lg text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/explore" className="group relative bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 overflow-hidden inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Explore Features</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-blue-500"></div>
            </Link>
          </div>

          {/* Right Side - Premium Floating Feature Cards */}
          <div ref={rightRef} className={`relative scroll-reveal-right ${rightVisible ? 'is-visible' : ''}`}>
            <div className="relative w-full h-[600px] md:h-[650px]">
              {/* Pose Detection Card - Top Right */}
              <div className="absolute top-0 right-0 w-64 md:w-72 premium-card rounded-3xl p-6 animate-float hover-lift glow-border shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600/30 to-blue-600/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Pose Detection</h3>
                <p className="text-slate-400 text-sm">33 keypoint tracking</p>
              </div>

              {/* ML Analysis Card - Middle Right */}
              <div className="absolute top-56 right-8 w-64 md:w-72 premium-card rounded-3xl p-6 animate-float-delayed hover-lift glow-border shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600/30 to-purple-600/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">ML Analysis</h3>
                <p className="text-slate-400 text-sm">Real-time form check</p>
              </div>

              {/* Audio Feedback Card - Middle Bottom Right */}
              <div className="absolute bottom-32 -right-[400px] md:-right-[400px] w-64 md:w-72 premium-card rounded-3xl p-6 animate-float-slow hover-lift glow-border shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600/30 to-pink-600/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Audio Feedback</h3>
                <p className="text-slate-400 text-sm">Voice corrections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
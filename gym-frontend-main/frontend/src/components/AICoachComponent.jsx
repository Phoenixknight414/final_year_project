import { useScrollReveal } from '../hooks/useScrollReveal.js';

export default function AICoachComponent() {
  const [leftRef, leftVisible] = useScrollReveal({ threshold: 0.2 });
  const [rightRef, rightVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <section 
      id="ai-coach" 
      className="py-32 px-6 bg-slate-950 relative overflow-hidden"
    >
      {/* Radial glow background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Two-column layout - vertically centered */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Glowing circular visual with icon */}
          <div 
            ref={leftRef}
            className={`flex justify-center md:justify-start scroll-reveal-left ${leftVisible ? 'is-visible' : ''}`}
          >
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 md:ml-8">
              {/* Outer subtle ring */}
              <div className="absolute inset-0 rounded-full border border-slate-800/40"></div>
              
              {/* Middle subtle ring */}
              <div className="absolute inset-8 rounded-full border border-slate-700/30"></div>
              
              {/* Inner glowing container with floating animation */}
              <div className="absolute inset-16 rounded-3xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-sm flex items-center justify-center animate-float shadow-2xl shadow-blue-600/20">
                {/* Icon */}
                <svg className="w-20 h-20 lg:w-24 lg:h-24 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                </svg>
              </div>
              
              {/* Subtle floating accent dots */}
              <div className="absolute top-8 left-1/2 w-2 h-2 bg-blue-400/60 rounded-full -translate-x-1/2 animate-pulse-subtle"></div>
              <div className="absolute bottom-16 right-8 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse-subtle" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {/* Right Column - Feature checklist and button */}
          <div 
            ref={rightRef}
            className={`scroll-reveal-right ${rightVisible ? 'is-visible' : ''}`}
          >
            {/* Heading - left-aligned, reduced spacing */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Meet Your <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">AI Coach</span>
            </h2>
            
            {/* Subheading */}
            <p className="text-xl text-slate-400 mb-10">Your Personalized AI Trainer</p>

            {/* Feature checklist */}
            <div className="space-y-5 mb-10">
              {[
                'Real-time posture correction',
                'Personalized workout plans',
                'Voice-guided coaching',
                'Progress tracking & analytics'
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 transition-all duration-300 hover:translate-x-2"
                  style={{transitionDelay: `${idx * 0.1}s`}}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-lg text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className="group relative bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-blue-500"></div>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
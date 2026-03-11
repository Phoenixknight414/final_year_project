import { useScrollReveal } from '../hooks/useScrollReveal.js';

export default function HowItWorksComponent() {
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [stepsRef, stepsVisible] = useScrollReveal({ threshold: 0.2 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });

  const steps = [
    {
      number: '01',
      title: 'Set Up Your Camera',
      description: 'Position your device camera to capture your full body during workouts.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
      )
    },
    {
      number: '02',
      title: 'Choose Your Workout',
      description: 'Select from AI-generated personalized workout plans tailored to your goals.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      )
    },
    {
      number: '03',
      title: 'Get Real-Time Feedback',
      description: 'Receive instant posture corrections and voice guidance as you exercise.',
      icon: (
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      )
    }
  ];

  const features = [
    {
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </>
      ),
      title: 'Ask for Workout Tips',
      description: 'Get personalized exercise recommendations based on your goals and fitness level.'
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>,
      title: 'Real-time Coaching',
      description: 'Receive instant audio and text feedback while you exercise to perfect your form.'
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>,
      title: 'Track Your Progress',
      description: 'Monitor your fitness journey with detailed analytics and personalized insights.'
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="py-32 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-3xl animate-gradient-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-3xl animate-gradient-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - How It Works */}
        <div ref={headerRef} className={`text-center mb-20 scroll-reveal ${headerVisible ? 'is-visible' : ''}`}>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            How It <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
            Get started with GYMeye in three simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-32">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`group premium-card rounded-3xl p-8 glow-border scroll-reveal ${stepsVisible ? 'is-visible' : ''} transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden`}
              style={{transitionDelay: `${idx * 0.15}s`}}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-blue-500/10 -z-10"></div>
              
              {/* Step Number */}
              <div className="text-6xl font-bold text-blue-500/20 mb-6 transition-colors duration-300 relative z-10">{step.number}</div>
              
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600/30 to-blue-600/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 relative z-10">
                <svg className="w-8 h-8 text-blue-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {step.icon}
                </svg>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 text-white transition-colors duration-300 relative z-10">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed transition-colors duration-300 relative z-10">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section - Start Your Fitness Journey */}
        <div ref={ctaRef}>
          {/* CTA Heading */}
          <div className={`text-center mb-16 scroll-reveal ${ctaVisible ? 'is-visible' : ''}`}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Start Your <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">Fitness Journey</span> Today
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
              Sign up and start achieving your fitness goals with AI-powered coaching and<br className="hidden md:block" />
              personalized workout plans.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto mb-16">
            {features.map((card, idx) => (
              <div 
                key={idx} 
                className={`group premium-card rounded-3xl p-8 flex-1 glow-border scroll-reveal ${ctaVisible ? 'is-visible' : ''} transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/30 relative overflow-hidden`}
                style={{transitionDelay: `${idx * 0.15}s`}}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-blue-500/10 -z-10"></div>
                
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/30 to-blue-600/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 relative z-10">
                  <svg className="w-10 h-10 text-blue-400 transition-all duration-500 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white transition-all duration-500 group-hover:text-blue-100 relative z-10">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed transition-colors duration-500 group-hover:text-slate-300 relative z-10">{card.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className={`flex justify-center scroll-reveal ${ctaVisible ? 'is-visible' : ''}`} style={{transitionDelay: '0.6s'}}>
            <button className="group relative bg-blue-600 hover:bg-blue-700 px-12 py-4 rounded-xl font-semibold text-xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl bg-blue-500"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HeroComponent() {
  return (
    <section className="pt-40 pb-32 px-6 relative overflow-hidden min-h-screen flex items-center">
      {/* Premium animated background - matching reference opacity and positioning */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-3xl animate-gradient-drift"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-3xl animate-gradient-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-3xl animate-gradient-drift" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Subtle grid overlay - matching reference */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {/* Badge - exact positioning and styling from reference */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950/40 border border-blue-800/40 rounded-full text-blue-400 text-sm mb-16 backdrop-blur-sm hover:border-blue-700/60 transition-colors duration-300">
            <svg className="w-4 h-4 animate-pulse-subtle" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
            AI-Powered Fitness Revolution
          </div>
        </div>

        {/* Main heading - exact typography scale from reference */}
        <h1 className="text-center mb-8 leading-[1.1]">
          <span className="block text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-slate-200">
            Achieve Your
          </span>
          <span className="block text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white">
            Fitness Goals with
          </span>
          <span className="block text-6xl md:text-7xl lg:text-[5.5rem] font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            GYMeye
          </span>
        </h1>

        {/* Description - exact width and spacing from reference */}
        <p className="text-lg md:text-xl text-slate-400 text-center max-w-3xl mx-auto mb-14 leading-relaxed">
          Boost your health and workout smarter with the power of AI. Real-time<br className="hidden md:block" />
          posture correction using computer vision — just your camera.
        </p>

        {/* Buttons - exact sizing and spacing from reference */}
        <div className="flex items-center justify-center gap-4">
          <button className="group relative bg-blue-600 hover:bg-blue-700 px-9 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2.5 hover:scale-[1.02] overflow-hidden shadow-lg shadow-blue-600/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-blue-500/50"></div>
          </button>
          <button className="group border-2 border-slate-700/60 hover:border-slate-600 px-9 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2.5 hover:scale-[1.02] backdrop-blur-sm bg-slate-900/20 hover:bg-slate-900/40">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
            </svg>
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}
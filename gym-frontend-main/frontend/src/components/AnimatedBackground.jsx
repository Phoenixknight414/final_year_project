const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/50 rounded-full blur-lg animate-gradient-drift"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/50 rounded-full blur-lg animate-gradient-drift-2"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/50 rounded-full blur-lg animate-gradient-drift-3"></div>
        <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-pink-500/40 rounded-full blur-lg animate-gradient-drift-4"></div>
      </div>
    </div>
  );
};

export default AnimatedBackground;

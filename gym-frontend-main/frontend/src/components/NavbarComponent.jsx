import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NavbarComponent() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'navbar-scrolled' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo - fade in on load */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover-glow">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold">
            GYM<span className="text-blue-500">eye</span>
          </span>
        </div>
        
        {/* Nav links - fade in with delay */}
        <div className="hidden md:flex items-center gap-8 text-slate-300 animate-fade-in animate-delay-200">
          <a href="#ai-coach" className="hover:text-white transition-colors duration-300">AI Coach</a>
          <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How It Works</a>
        </div>

        {/* Action buttons - fade in with delay */}
        <div className="flex items-center gap-4 animate-fade-in animate-delay-300">
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 hover-glow">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
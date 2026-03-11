import { useEffect } from 'react';
import AuthModal from '../components/AuthModal';

export default function LoginPage() {
  useEffect(() => {
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-gradient-drift"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-gradient-drift" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-gradient-drift" style={{animationDelay: '6s'}}></div>
      </div>

      {/* Auth Modal - Centered with internal scroll */}
      <div className="relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <AuthModal />
      </div>
    </div>
  );
}

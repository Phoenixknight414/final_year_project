import { useEffect } from 'react';
import AuthModal from '../components/AuthModal';
import AnimatedBackground from '../components/AnimatedBackground';

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
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-hidden">
      <AnimatedBackground />

      {/* Auth Modal - Centered with internal scroll */}
      <div className="relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <AuthModal />
      </div>
    </div>
  );
}

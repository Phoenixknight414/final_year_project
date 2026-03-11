import { useScrollReveal } from '../hooks/useScrollReveal.js';

export default function FooterComponent() {
  const [footerRef, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <footer ref={footerRef} className="border-t border-slate-800 py-16 px-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          {/* Logo and Description Column */}
          <div className={`col-span-2 md:col-span-1 scroll-reveal ${isVisible ? 'is-visible' : ''}`}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                </svg>
              </div>
              <span className="text-xl font-bold">
                GYM<span className="text-blue-500">eye</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-powered fitness trainer for real-time posture correction.
            </p>
          </div>

          {/* Quick Links */}
          <div className={`scroll-reveal ${isVisible ? 'is-visible' : ''}`} style={{transitionDelay: '0.1s'}}>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Stats</a></li>
            </ul>
          </div>

          {/* About Us */}
          <div className={`scroll-reveal ${isVisible ? 'is-visible' : ''}`} style={{transitionDelay: '0.2s'}}>
            <h4 className="font-semibold text-white mb-4">About Us</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Project</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className={`scroll-reveal ${isVisible ? 'is-visible' : ''}`} style={{transitionDelay: '0.3s'}}>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={`scroll-reveal ${isVisible ? 'is-visible' : ''}`} style={{transitionDelay: '0.4s'}}>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report Issue</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={`border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 scroll-reveal ${isVisible ? 'is-visible' : ''}`} style={{transitionDelay: '0.5s'}}>
          <p>© 2024 GYMeye. All rights reserved.</p>
          <p>
            A Final Year Project by <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">Group 2</a> — CSE 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
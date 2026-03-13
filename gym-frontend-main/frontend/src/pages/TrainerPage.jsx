import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Mic, MessageSquare, Send, User, Loader2, Square } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

export default function TrainerPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hello! I'm your AI fitness coach. I can help you with personalized diet plans, workout routines, and answer any fitness questions. Just speak to me!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const audioWsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      // Small delay to ensure the input is visible before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isChatOpen]);

  // Hide loading screen after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 1200); // 1.2 seconds for robot animation

    return () => clearTimeout(timer);
  }, []);

  // Connect to trainer WebSocket for text messages
  useEffect(() => {
    const connectTrainerWs = () => {
      const ws = new WebSocket('ws://127.0.0.1:8000/ws/trainer');
      
      ws.onopen = () => {
        console.log('Connected to trainer WebSocket');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle exercise redirect
        if (data.type === 'exercise_redirect') {
          navigate(data.route, { state: { exercise: data.exercise } });
          return;
        }
        
        if (data.type === 'stream') {
          // Handle streaming response
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id === data.assistantId) {
              return prev.map(msg => 
                msg.id === data.assistantId 
                  ? { ...msg, text: msg.text + data.token }
                  : msg
              );
            } else {
              return [...prev, {
                id: data.assistantId,
                role: 'assistant',
                text: data.token,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }];
            }
          });
        } else if (data.type === 'done') {
          setIsLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed, reconnecting...');
        setTimeout(connectTrainerWs, 3000);
      };

      wsRef.current = ws;
    };

    connectTrainerWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // If AI is currently responding, stop it first
    if (isLoading) {
      stopAIResponse();
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    
    const assistantId = Date.now() + 1;
    wsRef.current.send(JSON.stringify({
      message: inputText,
      assistantId: assistantId
    }));

    setInputText("");
    setIsLoading(true);
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
    // Optionally close and reconnect WebSocket to stop generation
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Connect to audio WebSocket
      const audioWs = new WebSocket('ws://127.0.0.1:8000/ws/audio');
      audioWsRef.current = audioWs;

      audioWs.onopen = () => {
        console.log('Connected to audio WebSocket');
      };

      audioWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle exercise redirect
        if (data.type === 'exercise_redirect') {
          navigate(data.route, { state: { exercise: data.exercise } });
          setIsLoading(false);
          return;
        }
        
        if (data.type === 'final_transcript') {
          const userMessage = {
            id: Date.now(),
            role: "user",
            text: `🎤 ${data.text}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, userMessage]);
        } else if (data.type === 'assistant') {
          const aiResponse = {
            id: Date.now() + 1,
            role: "assistant",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiResponse]);
          setIsLoading(false);
        }
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && audioWs.readyState === WebSocket.OPEN) {
          audioWs.send(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioWs.readyState === WebSocket.OPEN) {
          audioWs.send(JSON.stringify({ type: 'stop' }));
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Send chunks every 100ms
      setIsRecording(true);
      setIsLoading(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Keep isLoading true until AI response completes
    }
  };

  const stopAIResponse = () => {
    setIsLoading(false);
    // Optionally close and reconnect WebSocket to stop generation
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (audioWsRef.current) {
      audioWsRef.current.close();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else if (isLoading) {
      stopAIResponse();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col relative">
      <AnimatedBackground />
      
      {/* Loading Screen with Robot Animation */}
      {showLoadingScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="text-center flex flex-col items-center">
            {/* Robot Running on Treadmill */}
            <div className="relative mb-6">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Treadmill Base */}
                <rect x="30" y="165" width="140" height="6" rx="3" fill="url(#treadmillGrad)" opacity="0.6"/>
                
                {/* Treadmill Belt Lines (moving) */}
                <g opacity="0.4">
                  <line x1="40" y1="168" x2="65" y2="168" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
                    <animate attributeName="x1" values="40;170" dur="0.4s" repeatCount="indefinite"/>
                    <animate attributeName="x2" values="65;195" dur="0.4s" repeatCount="indefinite"/>
                  </line>
                  <line x1="80" y1="168" x2="105" y2="168" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
                    <animate attributeName="x1" values="80;210" dur="0.4s" repeatCount="indefinite"/>
                    <animate attributeName="x2" values="105;235" dur="0.4s" repeatCount="indefinite"/>
                  </line>
                  <line x1="120" y1="168" x2="145" y2="168" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
                    <animate attributeName="x1" values="120;250" dur="0.4s" repeatCount="indefinite"/>
                    <animate attributeName="x2" values="145;275" dur="0.4s" repeatCount="indefinite"/>
                  </line>
                </g>

                {/* Antenna - Falls and explodes */}
                <g>
                  <animateTransform 
                    attributeName="transform" 
                    type="translate" 
                    values="0,-150; 0,0; -30,-40" 
                    dur="1.2s" 
                    fill="freeze"
                    keyTimes="0; 0.3; 1"
                    calcMode="spline"
                    keySplines="0.34 1.56 0.64 1; 0.8 0 1 1"/>
                  <animate attributeName="opacity" values="1; 1; 0" dur="1.2s" fill="freeze" keyTimes="0; 0.3; 1"/>
                  <line x1="100" y1="60" x2="100" y2="80" stroke="url(#outlineGrad)" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="100" cy="60" r="4" fill="url(#glowGrad)"/>
                </g>

                {/* Robot Head - Falls and explodes */}
                <g>
                  <animateTransform 
                    attributeName="transform" 
                    type="translate" 
                    values="0,-150; 0,0; 0,0" 
                    dur="1.2s" 
                    fill="freeze"
                    keyTimes="0; 0.3; 1"
                    calcMode="spline"
                    keySplines="0.34 1.56 0.64 1; 0.42 0 0.58 1"/>
                  <animate attributeName="opacity" values="1; 1; 0" dur="1.2s" fill="freeze" keyTimes="0; 0.3; 0.4"/>
                  
                  {/* Head */}
                  <rect x="70" y="80" width="60" height="50" rx="12" stroke="url(#outlineGrad)" strokeWidth="4" fill="none"/>
                  
                  {/* Eyes */}
                  <rect x="82" y="98" width="10" height="14" rx="3" fill="url(#eyeGrad)"/>
                  <rect x="108" y="98" width="10" height="14" rx="3" fill="url(#eyeGrad)"/>

                  {/* Mouth */}
                  <path d="M 85 115 Q 100 120 115 115" stroke="url(#outlineGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </g>

                {/* Explosion Particles */}
                <g>
                  <animate attributeName="opacity" values="0; 0; 1; 0" dur="1.2s" fill="freeze" keyTimes="0; 0.3; 0.35; 1"/>
                  <circle cx="100" cy="100" r="3" fill="#60a5fa">
                    <animate attributeName="cx" values="100; 70" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                    <animate attributeName="cy" values="100; 80" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                  </circle>
                  <circle cx="100" cy="100" r="3" fill="#a78bfa">
                    <animate attributeName="cx" values="100; 130" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                    <animate attributeName="cy" values="100; 75" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                  </circle>
                  <circle cx="100" cy="100" r="3" fill="#c084fc">
                    <animate attributeName="cx" values="100; 85" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                    <animate attributeName="cy" values="100; 120" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                  </circle>
                  <circle cx="100" cy="100" r="3" fill="#60a5fa">
                    <animate attributeName="cx" values="100; 115" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                    <animate attributeName="cy" values="100; 125" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                  </circle>
                  <circle cx="100" cy="100" r="2" fill="#a78bfa">
                    <animate attributeName="cx" values="100; 60" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                    <animate attributeName="cy" values="100; 100" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                  </circle>
                  <circle cx="100" cy="100" r="2" fill="#c084fc">
                    <animate attributeName="cx" values="100; 140" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                    <animate attributeName="cy" values="100; 105" dur="1.2s" fill="freeze" keyTimes="0; 1"/>
                  </circle>
                </g>

                {/* Floating Head - Appears after explosion */}
                <g>
                  <animate attributeName="opacity" values="0; 0; 1" dur="1.2s" fill="freeze" keyTimes="0; 0.4; 0.6"/>
                  <animateTransform 
                    attributeName="transform" 
                    type="translate" 
                    values="0,0; 0,-3; 0,0" 
                    dur="2s" 
                    repeatCount="indefinite"
                    begin="0.5s"/>
                  
                  {/* Antenna */}
                  <line x1="100" y1="60" x2="100" y2="80" stroke="url(#outlineGrad)" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="100" cy="60" r="4" fill="url(#glowGrad)">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.5s"/>
                  </circle>

                  {/* Head */}
                  <rect x="70" y="80" width="60" height="50" rx="12" stroke="url(#outlineGrad)" strokeWidth="4" fill="none"/>
                  
                  {/* Eyes */}
                  <rect x="82" y="98" width="10" height="14" rx="3" fill="url(#eyeGrad)"/>
                  <rect x="108" y="98" width="10" height="14" rx="3" fill="url(#eyeGrad)"/>

                  {/* Mouth - Smile */}
                  <path d="M 85 115 Q 100 120 115 115" stroke="url(#outlineGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </g>

                <defs>
                  <linearGradient id="outlineGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="50%" stopColor="#a78bfa"/>
                    <stop offset="100%" stopColor="#c084fc"/>
                  </linearGradient>
                  <linearGradient id="treadmillGrad" x1="30" y1="168" x2="170" y2="168" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e293b"/>
                    <stop offset="50%" stopColor="#334155"/>
                    <stop offset="100%" stopColor="#1e293b"/>
                  </linearGradient>
                  <radialGradient id="glowGrad" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </radialGradient>
                  <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-fade-in">
              Hey there!
            </h2>
            <p className="text-slate-400 text-sm mt-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>Your AI Coach is ready</p>
            
            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold">GYM<span className="text-blue-500">eye</span> AI</h1>
            <p className="text-xs text-slate-400">Voice Coach</p>
          </div>
        </div>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Messages Area with 200px side margins - Add top padding for fixed header */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 pb-64 pt-24">
        <div className="mx-auto space-y-4" style={{ maxWidth: 'calc(100vw - 400px)', minWidth: '400px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30'
                  : 'bg-slate-700'
              }`}>
                {message.role === 'assistant' ? (
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`} style={{ maxWidth: '650px' }}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-slate-800/60 backdrop-blur-sm'
                    : 'bg-blue-600/90'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
                <span className="text-xs text-slate-500 mt-1 px-2">{message.timestamp}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#0f1419] via-[#0f1419] to-transparent pt-8 pb-6">
        {/* Text Input Area - Slides up when chat is open */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isChatOpen ? 'max-h-32 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="mx-auto px-6 flex items-center gap-3" style={{ maxWidth: 'calc(100vw - 400px)', minWidth: '400px' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              onClick={isLoading ? handleStopGeneration : handleSendMessage}
              disabled={!isLoading && !inputText.trim()}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <Square className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Three Control Buttons - Fixed position */}
        <div className="flex items-center justify-center gap-6">
          {/* Volume Button */}
          <button className="w-14 h-14 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/60 flex items-center justify-center transition-all">
            <Volume2 className="w-6 h-6 text-slate-400" />
          </button>

          {/* Mic Button - Center, Larger */}
          <button
            onClick={toggleRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 scale-110'
                : isLoading
                ? 'bg-orange-600 hover:bg-orange-700 scale-110'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading && !isRecording ? (
              <Square className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          {/* Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all ${
              isChatOpen
                ? 'bg-blue-600 border-blue-500 scale-110'
                : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60'
            }`}
          >
            <MessageSquare className={`w-6 h-6 ${isChatOpen ? 'text-white' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Hint Text */}
        <div className="text-center mt-4">
          <p className="text-xs text-slate-500">
            {isLoading && !isRecording 
              ? 'AI is responding... Tap mic to stop' 
              : isRecording 
              ? 'Recording... Tap mic to stop' 
              : isChatOpen 
              ? 'Type your message' 
              : 'Tap to start voice chat'}
          </p>
        </div>
      </div>
    </div>
  );
}

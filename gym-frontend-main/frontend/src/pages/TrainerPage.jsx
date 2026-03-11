import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Mic, MessageSquare, Send, User, Loader2, Square } from "lucide-react";

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
  const messagesEndRef = useRef(null);
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
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      {/* Animated background - matching landing page */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-[200vw] h-[200vh] left-[-50vw] top-[-50vh] opacity-30">
          <div className="absolute top-[20%] left-[10%] w-[650px] h-[650px] bg-blue-400 rounded-full blur-sm animate-gradient-drift"></div>
          <div className="absolute top-[60%] left-[70%] w-[700px] h-[700px] bg-violet-400 rounded-full blur-sm animate-gradient-pulse"></div>
          <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-indigo-300 rounded-full blur-sm animate-gradient-float"></div>
          <div className="absolute top-[30%] left-[80%] w-[550px] h-[550px] bg-purple-400 rounded-full blur-sm animate-gradient-drift" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-[70%] left-[20%] w-[500px] h-[500px] bg-blue-300 rounded-full blur-sm animate-gradient-pulse" style={{animationDelay: '6s'}}></div>
        </div>
      </div>
      
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
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-64 pt-20">
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
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1419] via-[#0f1419] to-transparent pt-8 pb-6">
        {/* Text Input Area - Slides up when chat is open */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isChatOpen ? 'max-h-32 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="mx-auto px-6 flex items-center gap-3" style={{ maxWidth: 'calc(100vw - 400px)', minWidth: '400px' }}>
            <input
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
            disabled={isLoading && !isRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 scale-110'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Mic className="w-7 h-7" />
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
            {isLoading ? 'Processing...' : isRecording ? 'Recording... Tap mic to stop' : isChatOpen ? 'Type your message' : 'Tap to start voice chat'}
          </p>
        </div>
      </div>
    </div>
  );
}

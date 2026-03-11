import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Square,
  Send,
  Paperclip,
  Volume2,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/**
 * Backend expectations (adjust in sendText/sendAudio):
 * - Text request: POST /api/trainer/text   { text: "..." }
 * - Audio request: POST /api/trainer/audio  form-data: audio=<blob/file>
 * Response: { text: "...", audioUrl?: "https://...", audioBase64?: "...", audioMime?: "audio/mpeg" }
 */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function base64ToObjectUrl(base64, mime = "audio/mpeg") {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++)
    byteNumbers[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
  return URL.createObjectURL(blob);
}

function SoftWave({ analyser, isActive }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const buffer = new Uint8Array(1024);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      // Background glow lines
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.roundRect?.(0, 0, w, h, 18);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fill();
      ctx.globalAlpha = 1;

      // Waveform
      const mid = h / 2;
      const amp = Math.max(10, h * 0.25);

      if (analyser && isActive) {
        analyser.getByteTimeDomainData(buffer);
      } else {
        // idle animation
        const t = Date.now() * 0.002;
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = 128 + Math.sin(t + i * 0.06) * 10;
        }
      }

      ctx.lineWidth = 2.25;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.shadowColor = "rgba(168,85,247,0.55)";
      ctx.shadowBlur = 18;

      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const idx = Math.floor((x / w) * (buffer.length - 1));
        const v = (buffer[idx] - 128) / 128;
        const y = mid + v * amp;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Sub-wave
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const idx = Math.floor((x / w) * (buffer.length - 1));
        const v = (buffer[idx] - 128) / 128;
        const y =
          mid + v * amp * 0.5 + Math.sin(Date.now() * 0.002 + x * 0.02) * 3;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser, isActive]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="h-24 w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
    </div>
  );
}

export default function TrainerPage() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Ask me anything. You can type or use the mic.",
      ts: Date.now(),
    },
  ]);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  // recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const wsRef = useRef(null);
  const audioWsRef = useRef(null);

  // audio viz
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const micStreamRef = useRef(null);

  // scroll
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const canSendText = useMemo(
    () => text.trim().length > 0 && !busy,
    [text, busy],
  );

  const pushUserMessage = (payload) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", ts: Date.now(), ...payload },
    ]);
  };

  const pushAssistantMessage = (payload) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        ts: Date.now(),
        ...payload,
      },
    ]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Cleared. Ask me anything.",
        ts: Date.now(),
      },
    ]);
  };

  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws/trainer");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WS message:", data);
      if (data.type == "exercise_redirect") {
        navigate("/live-workout", { state: { exercise: data.exercise } });
      }

      if (data.type === "stream") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.assistantId
              ? { ...msg, text: msg.text + data.token }
              : msg,
          ),
        );
      }

      if (data.type === "done") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.assistantId ? { ...msg, streaming: false } : msg,
          ),
        );
        setBusy(false);
      }

      if (data.type === "final") {
        let audioUrl = data.audioUrl;

        if (!audioUrl && data.audioBase64) {
          audioUrl = base64ToObjectUrl(
            data.audioBase64,
            data.audioMime || "audio/mpeg",
          );
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.assistantId ? { ...msg, audioUrl } : msg,
          ),
        );
      }
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const onSendText = async () => {
    const userText = text.trim();
    if (!userText || busy) return;

    setText("");
    pushUserMessage({ text: userText });

    setBusy(true);

    // create empty assistant message
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        text: "",
        ts: Date.now(),
        streaming: true,
      },
    ]);

    wsRef.current.send(
      JSON.stringify({
        type: "text",
        message: userText,
        assistantId,
      }),
    );
  };

  useEffect(() => {
    openAudioSocket();

    return () => {
      // cleanup when component unmounts
      if (audioWsRef.current) {
        audioWsRef.current.close();
        audioWsRef.current = null;
      }
    };
  }, []);

  const openAudioSocket = () => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/audio");
    ws.binaryType = "arraybuffer";

    ws.onopen = () => console.log("audio ws connected");
    ws.onmessage = (evt) => {
      // backend can send transcript + assistant reply
      // expected JSON
      setBusy(false);
      try {
        const msg = JSON.parse(evt.data);
        console.log(msg.type)
        if (msg.type === "final_transcript") {
          pushUserMessage({ text: `📝 ${msg.text}` });
        } else if (msg.type === "assistant") {
          pushAssistantMessage({ text: msg.text });
        } else if (msg.type === "exercise_redirect") {
          navigate("/live-workout", { state: { exercise: msg.exercise } });
        } else if (msg.type === "error") {
          pushAssistantMessage({ text: `Error: ${msg.message}` });
        }
      } catch {
        // ignore non-json
      }
    };

    ws.onerror = () =>
      pushAssistantMessage({ text: "Error: audio socket failed" });
    ws.onclose = () => console.log("audio ws closed");

    audioWsRef.current = ws;
  };

  const startRecording = async () => {
    if (busy) return;

    if (
      !audioWsRef.current ||
      audioWsRef.current.readyState !== WebSocket.OPEN
    ) {
      pushAssistantMessage({ text: "Audio socket not connected." });
      return;
    }

    let chunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ac = new AudioCtx();
    audioCtxRef.current = ac;

    const analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const src = ac.createMediaStreamSource(stream);
    sourceRef.current = src;
    src.connect(analyser);

    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mr.onstop = async () => {
      // cleanup mic
      stream.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;

      try {
        sourceRef.current?.disconnect();
      } catch {}
      sourceRef.current = null;

      try {
        await audioCtxRef.current?.close();
      } catch {}
      audioCtxRef.current = null;
      analyserRef.current = null;

      // ✅ Create ONE proper WebM file
      const blob = new Blob(chunks, { type: "audio/webm" });
      const buf = await blob.arrayBuffer();

      // ✅ Send complete file
      audioWsRef.current?.send(buf);

      // ✅ Tell backend recording finished
      audioWsRef.current?.send(JSON.stringify({ type: "stop" }));

      chunks = [];

      setBusy(true);
    };
    // IMPORTANT: timeslice makes it stream
    mr.start(); // 250ms chunks (or 500)
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    console.log("recording stopped");
    try {
      mediaRecorderRef.current.stop();
    } catch {}
    setIsRecording(false);
  };

  const onUploadAudio = async (file) => {
    if (!file || busy) return;

    pushUserMessage({ text: `📎 Uploaded: ${file.name}` });

    setBusy(true);
    try {
      const data = await sendAudio(file);
      await handleAssistantOutput(data);
    } catch (e) {
      pushAssistantMessage({
        text: e?.message ? `Error: ${e.message}` : "Error: request failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    const a = new Audio(audioUrl);
    a.play().catch(() => {});
  };

  return (
    <div className="min-h-[calc(100vh-0px)] w-full bg-zinc-950 text-zinc-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/10 via-sky-400/10 to-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Sparkles className="h-5 w-5 text-violet-200" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Trainer</h1>
              <Badge className="border-white/10 bg-white/5 text-zinc-200">
                Voice + Text
              </Badge>
            </div>
            <p className="text-sm text-zinc-300/80">
              Modern assistant UI with waveform + mic. Inspired by the
              sound-wave assistant concept.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
              onClick={clearChat}
              disabled={busy || isRecording}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Wave + Mic */}
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="text-zinc-100">Voice Control</span>
              <span className="text-xs text-zinc-300/70">
                {isRecording ? "Listening…" : busy ? "Thinking…" : "Ready"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SoftWave analyser={analyserRef.current} isActive={isRecording} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  className={cn(
                    "h-11 rounded-2xl px-4",
                    isRecording
                      ? "bg-red-500/90 hover:bg-red-500 text-white"
                      : "bg-violet-600 hover:bg-violet-600/90 text-white",
                  )}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={busy}
                >
                  {isRecording ? (
                    <>
                      <Square className="mr-2 h-4 w-4" /> Stop
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" /> Hold to talk
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  className="h-11 rounded-2xl border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                  disabled={!messages.some((m) => m.audioUrl)}
                  onClick={() => {
                    // play latest assistant audio
                    const lastAudio = [...messages]
                      .reverse()
                      .find(
                        (m) => m.role === "assistant" && m.audioUrl,
                      )?.audioUrl;
                    if (lastAudio) playAudio(lastAudio);
                  }}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Play last audio
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10">
                  <Paperclip className="h-4 w-4" />
                  Upload audio
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => onUploadAudio(e.target.files?.[0])}
                    disabled={busy}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-2">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                      "flex w-full",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[86%] rounded-3xl px-4 py-3 ring-1",
                        m.role === "user"
                          ? "bg-violet-600/25 ring-violet-300/15"
                          : "bg-white/[0.04] ring-white/10",
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs text-zinc-300/70">
                          {m.role === "user" ? "You" : "Trainer"} •{" "}
                          {formatTime(m.ts)}
                        </div>

                        {m.audioUrl ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-xl border border-white/10 bg-white/5 px-3 text-zinc-100 hover:bg-white/10"
                            onClick={() => playAudio(m.audioUrl)}
                          >
                            <Volume2 className="mr-2 h-4 w-4" />
                            Play
                          </Button>
                        ) : null}
                      </div>

                      {m.text ? (
                        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">
                          {m.text}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="mt-4 space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message…"
                className="min-h-[92px] resize-none rounded-2xl border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-violet-500/40"
                disabled={busy || isRecording}
              />

              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-zinc-300/70">
                  {busy
                    ? "Processing…"
                    : isRecording
                      ? "Recording…"
                      : "Enter to send (or click Send)"}
                </div>

                <Button
                  onClick={onSendText}
                  disabled={!canSendText}
                  className="h-11 rounded-2xl bg-violet-600 text-white hover:bg-violet-600/90"
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>

              {/* Optional single-line quick input */}
              <div className="hidden">
                <Input />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

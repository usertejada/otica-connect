"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "connecting" | "waiting" | "connected" | "ended" | "error";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [status, setStatus] = useState<Status>("connecting");
  const [statusText, setStatusText] = useState("Conectando...");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const currentCallRef = useRef<any>(null);

  useEffect(() => {
    const join = async () => {
      setStatusText("Solicitando câmera e microfone...");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        setStatus("error");
        setStatusText("Permita acesso à câmera e ao microfone e recarregue a página.");
        return;
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      setStatusText("Aguardando a doutora iniciar o atendimento...");
      setStatus("waiting");

      const { default: Peer } = await import("peerjs");
      const peer = new (Peer as any)(undefined, { debug: 0 });
      peerRef.current = peer;

      peer.on("open", () => {
        const call = peer.call(roomId, stream);
        currentCallRef.current = call;

        call.on("stream", (remoteStream: MediaStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setStatus("connected");
          setStatusText("Em atendimento");
        });

        call.on("close", () => {
          setStatus("ended");
          setStatusText("Atendimento encerrado");
        });

        call.on("error", () => {
          setStatus("error");
          setStatusText("Erro na conexão. Verifique sua internet.");
        });
      });

      peer.on("error", () => {
        setStatus("error");
        setStatusText("Não foi possível conectar. Verifique o link ou tente novamente.");
      });
    };

    join();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
    };
  }, [roomId]);

  const endCall = () => {
    currentCallRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    setStatus("ended");
    setStatusText("Você encerrou o atendimento");
  };

  const toggleMute = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0];
    if (audio) { audio.enabled = isMuted; setIsMuted(!isMuted); }
  };

  const toggleCam = () => {
    const video = localStreamRef.current?.getVideoTracks()[0];
    if (video) { video.enabled = isCamOff; setIsCamOff(!isCamOff); }
  };

  return (
    <div className="min-h-screen bg-[#080809] flex flex-col">

      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">ÓticaVis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : status === "waiting" || status === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`} />
          <span className="text-white/60 text-xs">{statusText}</span>
        </div>
      </div>

      {/* Área de vídeo */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">

        {/* Vídeo remoto */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${status === "connected" ? "opacity-100" : "opacity-0"}`}
        />

        {/* Vídeo local pip */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute bottom-20 right-4 w-32 h-24 rounded-xl object-cover border-2 border-white/20 z-10 transition-opacity duration-300 ${status !== "error" && status !== "ended" ? "opacity-100" : "opacity-0"}`}
        />

        {/* Placeholder */}
        {status !== "connected" && (
          <div className="text-center z-10 px-6">
            {status === "error" ? (
              <>
                <div className="text-5xl mb-4 opacity-50">⚠️</div>
                <h2 className="text-white font-semibold text-xl mb-2">Ops!</h2>
                <p className="text-white/50 text-sm">{statusText}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-colors"
                >
                  Tentar novamente
                </button>
              </>
            ) : status === "ended" ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-white font-semibold text-xl mb-2">Atendimento encerrado</h2>
                <p className="text-white/50 text-sm">Obrigado! Pode fechar esta janela.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white/30" />
                </div>
                <h2 className="text-white font-semibold text-xl mb-2">Aguardando atendimento</h2>
                <p className="text-white/50 text-sm mb-6">{statusText}</p>
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              </>
            )}
          </div>
        )}

        {/* Controles */}
        <AnimatePresence>
          {(status === "waiting" || status === "connected") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
            >
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={toggleCam}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCamOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
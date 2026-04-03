"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CallStatus = "idle" | "waiting" | "connected" | "ended";

export default function RemotoPage() {
  const supabase = createClient();

  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomLink, setRoomLink] = useState("");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const currentCallRef = useRef<any>(null);

  // Busca peer_id do admin (proprietária da conta)
  useEffect(() => {
    async function fetchPeerId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Se for funcionário, busca o peer_id do admin (owner)
      const { data: profile } = await supabase
        .from("profiles")
        .select("peer_id, role, owner_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      let finalPeerId = profile.peer_id;

      // Se for funcionário, usa o peer_id do admin
      if (profile.role === "funcionario" && profile.owner_id) {
        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("peer_id")
          .eq("id", profile.owner_id)
          .single();
        if (adminProfile?.peer_id) finalPeerId = adminProfile.peer_id;
      }

      setPeerId(finalPeerId);
      setRoomLink(`${window.location.origin}/room/${finalPeerId}`);
    }
    fetchPeerId();
  }, []);

  const startCall = useCallback(async () => {
    if (!peerId) return;
    setErro(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      setErro("Permita acesso à câmera e ao microfone e tente novamente.");
      return;
    }

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const { default: Peer } = await import("peerjs");
    const peer = new (Peer as any)(peerId, { debug: 0 });
    peerRef.current = peer;

    peer.on("open", () => {
      setStatus("waiting");
    });

    peer.on("call", (call: any) => {
      call.answer(stream);
      currentCallRef.current = call;

      call.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setStatus("connected");
      });

      call.on("close", () => setStatus("ended"));
      call.on("error", () => setStatus("ended"));
    });

    peer.on("error", (err: any) => {
      console.error(err);
      setErro("Erro ao iniciar. Verifique sua conexão e tente novamente.");
      setStatus("idle");
      stream.getTracks().forEach((t) => t.stop());
    });
  }, [peerId]);

  const endCall = useCallback(async () => {
    currentCallRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStatus("ended");
    setIsMuted(false);
    setIsCamOff(false);
  }, []);

  const toggleMute = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0];
    if (audio) { audio.enabled = isMuted; setIsMuted(!isMuted); }
  };

  const toggleCam = () => {
    const video = localStreamRef.current?.getVideoTracks()[0];
    if (video) { video.enabled = isCamOff; setIsCamOff(!isCamOff); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="space-y-4">

      {/* Card principal da videochamada */}
      <div className="bg-card rounded-xl border border-border overflow-hidden max-w-5xl">

        {/* Área de vídeo */}
        <div className="relative bg-[#080809] aspect-video w-full flex items-center justify-center overflow-hidden">

          {/* Vídeo remoto (cliente) — tela cheia */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${status === "connected" ? "opacity-100" : "opacity-0"}`}
          />

          {/* Vídeo local (pip) */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`absolute bottom-4 right-4 w-36 h-24 lg:w-48 lg:h-32 rounded-xl object-cover border-2 border-border z-10 transition-opacity duration-300 ${status === "waiting" || status === "connected" ? "opacity-100" : "opacity-0"}`}
          />

          {/* Status badge */}
          <AnimatePresence>
            {status !== "idle" && status !== "ended" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 z-20"
              >
                <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-pulse"}`} />
                <span className="text-white text-xs font-medium">
                  {status === "waiting" ? "Aguardando cliente conectar..." : "Em atendimento"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placeholder idle */}
          {status === "idle" && (
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/40 text-sm mb-6">Clique em iniciar para começar o atendimento</p>
              <button
                onClick={startCall}
                disabled={!peerId}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <Video className="w-4 h-4" />
                Iniciar atendimento
              </button>
            </div>
          )}

          {/* Placeholder ended */}
          {status === "ended" && (
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white/60 text-sm mb-6">Atendimento encerrado</p>
              <button
                onClick={() => setStatus("idle")}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              >
                <Video className="w-4 h-4" />
                Novo atendimento
              </button>
            </div>
          )}

          {/* Controles da chamada */}
          <AnimatePresence>
            {(status === "waiting" || status === "connected") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
              >
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                  title={isMuted ? "Ativar microfone" : "Silenciar"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={endCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  title="Encerrar"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleCam}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCamOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                  title={isCamOff ? "Ativar câmera" : "Desativar câmera"}
                >
                  {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé com link fixo */}
        {roomLink && (
          <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
              <Wifi className="w-4 h-4" />
              <span className="text-xs font-medium">Link fixo do consultório:</span>
            </div>
            <div className="flex items-center gap-2 flex-1 w-full">
              <input
                readOnly
                value={roomLink}
                className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground font-mono truncate"
              />
              <button
                onClick={copyLink}
                className={`h-9 px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 ${copied ? "bg-green-100 text-green-700 border border-green-200" : "bg-muted hover:bg-muted/80 text-foreground border border-border"}`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" />Copiado!</> : <><Copy className="w-3.5 h-3.5" />Copiar</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Erro */}
      <AnimatePresence>
        {erro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive"
          >
            {erro}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Como funciona</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Inicie o atendimento", desc: "Clique em 'Iniciar atendimento' para ativar sua câmera e microfone" },
            { step: "2", title: "Compartilhe o link fixo", desc: "Envie o link do consultório para o cliente via WhatsApp — ele nunca muda" },
            { step: "3", title: "Cliente conecta", desc: "O cliente abre o link e entra automaticamente na videochamada" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
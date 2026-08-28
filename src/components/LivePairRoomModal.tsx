import React, { useState } from 'react';
import { Users, Copy, Check, LogOut, Timer, ShieldCheck, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeRoomId } from '../utils/security';

interface LivePairRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  roomId: string | null;
  isConnected: boolean;
  connectedPeerCount: number;
  timerSeconds: number | null;
  isTimerActive: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
  onStartTimer: (seconds: number) => void;
}

export const LivePairRoomModal: React.FC<LivePairRoomModalProps> = ({
  isOpen,
  onClose,
  isDark,
  roomId,
  connectedPeerCount,
  timerSeconds,
  isTimerActive,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onStartTimer,
}) => {
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareableUrl = roomId ? `${window.location.origin}/editor?room=${roomId}` : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    toast.success('Room link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeId = sanitizeRoomId(joinInput);
    if (!safeId) {
      toast.error('Invalid Room ID format!');
      return;
    }
    onJoinRoom(safeId);
  };

  const formatTimerDisplay = (seconds: number | null) => {
    if (seconds === null || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto select-none">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl flex flex-col gap-5 relative transition-all ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Users className="w-4 h-4 text-zinc-100" />
            </div>
            <div>
              <h3 className="text-sm font-bold m-0 font-sans">Live Pair Coding Room</h3>
              <p className={`text-xs m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Real-time WebRTC P2P Collaboration & Sprint Timer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Shield Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>100% P2P Encrypted & Protected against XSS attacks.</span>
        </div>

        {/* Room Status / Active Connection Card */}
        {roomId ? (
          <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono">Room ID: {roomId}</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{connectedPeerCount + 1} Connected</span>
                </span>
              </div>

              {/* Shareable Link Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className={`flex-1 text-xs font-mono p-2 rounded-xl border outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-300 text-zinc-800'
                  }`}
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Sprint Timer Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Sprint Countdown Timer</span>
                </span>
                {timerSeconds !== null && (
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {formatTimerDisplay(timerSeconds)}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[180, 300, 600].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onStartTimer(sec)}
                    disabled={isTimerActive}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                      timerSeconds === sec && isTimerActive
                        ? 'bg-amber-500 text-black border-amber-400'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                    }`}
                  >
                    {sec / 60} Mins
                  </button>
                ))}
              </div>
            </div>

            {/* Leave Room Button */}
            <button
              onClick={onLeaveRoom}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Live Room</span>
            </button>
          </div>
        ) : (
          /* Create or Join Controls */
          <div className="flex flex-col gap-4">
            <button
              onClick={onCreateRoom}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Create New Live Room</span>
            </button>

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">OR JOIN ROOM</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                placeholder="Enter Room ID (e.g. cm-abc123)"
                className={`flex-1 text-xs font-mono p-2.5 rounded-xl border outline-none ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                }`}
              />
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700' : 'bg-zinc-900 text-white'
                }`}
              >
                Join
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

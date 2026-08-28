import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Copy, Check, LogOut, Timer, ArrowLeft, User, Sparkles } from 'lucide-react';
import { useLivePairRoom } from '../hooks/useLivePairRoom';
import { Canvas } from './Canvas';
import { ControlPanel } from './ControlPanel';
import type { SnippetSettings } from '../types';
import { sanitizeRoomId } from '../utils/security';
import { toast } from 'sonner';

interface LivePairRoomPageProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}

export const LivePairRoomPage: React.FC<LivePairRoomPageProps> = ({
  settings,
  setSettings,
}) => {
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room');
  const [copied, setCopied] = useState(false);
  const [roomInput, setRoomInput] = useState('');

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  const updateActiveTabCode = (newCode: string) => {
    setSettings((prev) => {
      const activeId = prev.activeTabId;
      return {
        ...prev,
        tabs: prev.tabs.map((t) => (t.id === activeId ? { ...t, code: newCode } : t)),
      };
    });
  };

  const updateSetting = <K extends keyof SnippetSettings>(key: K, value: SnippetSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const {
    roomId,
    username,
    setUsername,
    isConnected,
    connectedPeerCount,
    timerSeconds,
    isTimerActive,
    peerCursors,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastCodeChange,
    startSprintTimer,
  } = useLivePairRoom({
    settings,
    updateSetting,
    updateActiveTabCode,
  });

  const isDark = settings.appTheme === 'dark';

  // Automatically join room if ?room= parameter exists in URL on mount
  useEffect(() => {
    if (roomParam && !roomId) {
      const safeId = sanitizeRoomId(roomParam);
      if (safeId) {
        joinRoom(safeId);
      }
    }
  }, [roomParam, roomId, joinRoom]);

  // Broadcast local code changes
  useEffect(() => {
    if (isConnected && activeTab?.code) {
      broadcastCodeChange(activeTab.code);
    }
  }, [activeTab?.code, isConnected, broadcastCodeChange]);

  const shareableUrl = roomId ? `${window.location.origin}/live?room=${roomId}` : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    toast.success('Live Pair Room link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeId = sanitizeRoomId(roomInput);
    if (!safeId) {
      toast.error('Invalid Room ID.');
      return;
    }
    joinRoom(safeId);
  };

  const formatTimerDisplay = (sec: number | null) => {
    if (sec === null || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`w-full border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl ${
          isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-zinc-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/editor"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold no-underline transition-all ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Editor</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 border-l border-zinc-800 pl-3">
            <Users className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-bold tracking-tight font-sans">Live Pair Coding Room</span>
          </div>
        </div>

        {/* Room Header Controls */}
        <div className="flex items-center gap-2">
          {/* Username Input Box */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
            }`}
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Anonymous"
              className="bg-transparent border-none outline-none text-xs font-mono w-24 sm:w-32"
            />
          </div>

          {roomId ? (
            <>
              {/* Sprint Timer Pill Display & Quick Start */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                <Timer className="w-3.5 h-3.5" />
                <span>{timerSeconds !== null && isTimerActive ? formatTimerDisplay(timerSeconds) : 'Sprint'}</span>
                {!isTimerActive && (
                  <div className="flex items-center gap-1 ml-1 border-l border-amber-500/20 pl-1.5">
                    {[180, 300, 600].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => startSprintTimer(sec)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 hover:bg-amber-500/30 cursor-pointer"
                        title={`Start ${sec / 60} min timer`}
                      >
                        {sec / 60}m
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Connected Peers Status Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{connectedPeerCount + 1} Connected</span>
              </div>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Share Link'}</span>
              </button>

              {/* Leave Room Button */}
              <button
                onClick={leaveRoom}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </>
          ) : (
            /* Create / Join Actions */
            <button
              onClick={createRoom}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Live Room</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Dedicated Workspace */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Column: Canvas + Peer Cursors Overlay */}
        <div
          className={`lg:col-span-8 h-full overflow-y-auto min-h-0 flex flex-col items-center p-4 sm:p-6 relative ${
            isDark ? 'bg-zinc-950/40' : 'bg-zinc-100/40'
          }`}
        >
          {/* Peer Cursors Badge Ribbon */}
          {peerCursors.size > 0 && (
            <div className="w-full max-w-2xl mb-3 flex flex-wrap gap-2 items-center justify-center">
              {Array.from(peerCursors.values()).map((peer) => (
                <div
                  key={peer.peerId}
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-200 shadow-md flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{peer.username || 'Anonymous'} is typing...</span>
                </div>
              ))}
            </div>
          )}

          {!roomId && (
            <div className="w-full max-w-md my-8 p-6 rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col gap-4 text-center">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <h3 className="text-base font-bold m-0 font-sans">Dedicated Live Pair Room</h3>
              <p className="text-xs text-zinc-400 m-0 leading-relaxed">
                Create a room or join a friend using a Room ID to code together in real-time.
              </p>

              <button
                onClick={createRoom}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Create Room Now
              </button>

              <form onSubmit={handleJoinSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Room ID (e.g. cm-abc123)"
                  className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-800 text-white"
                >
                  Join
                </button>
              </form>
            </div>
          )}

          {/* Canvas Container */}
          <div className="w-full flex-1 flex items-center justify-center my-auto">
            <Canvas settings={settings} setSettings={setSettings} />
          </div>
        </div>

        {/* Right Column: Control Panel */}
        <div className="lg:col-span-4 h-full overflow-y-auto min-h-0 border-l border-zinc-800">
          <ControlPanel settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  Timer,
  ArrowLeft,
  User,
  Sparkles,
  MessageSquare,
  Send,
  Code,
  ArrowRight,
  ShieldCheck,
  Palette,
  Info,
} from 'lucide-react';
import { useLivePairRoom } from '../hooks/useLivePairRoom';
import { Canvas } from './Canvas';
import { ControlPanel } from './ControlPanel';
import type { SnippetSettings } from '../types';
import { sanitizeRoomId } from '../utils/security';
import { SNIPPET_TEMPLATES } from '../utils/snippetTemplates';
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
  const [chatInput, setChatInput] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'settings'>('chat');
  const [isDisbandModalOpen, setIsDisbandModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCreatedRoomModalOpen, setIsCreatedRoomModalOpen] = useState(false);

  // Lobby form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('react-hook');
  const [selectedTimerPreset, setSelectedTimerPreset] = useState<number>(300);

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  // Tab-isolated code update (does not force tab switch on remote peer)
  const updateActiveTabCode = (newCode: string, targetTabId?: string) => {
    setSettings((prev) => {
      const activeId = targetTabId || prev.activeTabId;
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
    isHost,
    isConnected,
    isConnecting,
    connectedPeerCount,
    timerSeconds,
    isTimerActive,
    peerCursors,
    chatMessages,
    roomNotFoundError,
    setRoomNotFoundError,
    wasDisbandedByHost,
    setWasDisbandedByHost,
    createRoom,
    joinRoom,
    leaveRoom,
    disbandRoom,
    sendChatMessage,
    broadcastCodeChange,
    broadcastSettingChange,
    broadcastCursor,
    startSprintTimer,
  } = useLivePairRoom({
    settings,
    updateSetting,
    updateActiveTabCode,
  });

  const isDark = settings.appTheme === 'dark';

  const [isPendingUrlJoinModalOpen, setIsPendingUrlJoinModalOpen] = useState<boolean>(() => {
    return Boolean(roomParam && !roomId);
  });
  const [urlUsernameInput, setUrlUsernameInput] = useState<string>(() => {
    return localStorage.getItem('codemotion_live_username') || '';
  });

  // Broadcast local code changes for active tab
  useEffect(() => {
    if (isConnected && activeTab?.code) {
      broadcastCodeChange(activeTab.code, activeTab.id);
    }
  }, [activeTab?.code, activeTab?.id, isConnected, broadcastCodeChange]);

  // Broadcast settings changes (theme, background, font, diffMode)
  useEffect(() => {
    if (isConnected) {
      broadcastSettingChange({
        theme: settings.theme,
        background: settings.background,
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        diffMode: settings.diffMode,
        windowStyle: settings.windowStyle,
      });
    }
  }, [
    settings.theme,
    settings.background,
    settings.fontFamily,
    settings.fontSize,
    settings.diffMode,
    settings.windowStyle,
    isConnected,
    broadcastSettingChange,
  ]);

  const shareableUrl = roomId ? `${window.location.origin}/live?room=${roomId}` : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    toast.success('Live Pair Room link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateRoomFromLobby = () => {
    // Apply selected template code before launching room
    const tpl = SNIPPET_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (tpl) {
      setSettings((prev) => ({
        ...prev,
        theme: tpl.theme || prev.theme,
        background: tpl.background || prev.background,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? { ...t, code: tpl.code, title: tpl.fileName, language: tpl.language }
            : t
        ),
      }));
    }

    createRoom();
    setIsCreatedRoomModalOpen(true);

    if (selectedTimerPreset > 0) {
      setTimeout(() => {
        startSprintTimer(selectedTimerPreset);
      }, 500);
    }
  };

  const handleJoinRoomFromLobby = (e: React.FormEvent) => {
    e.preventDefault();
    const safeId = sanitizeRoomId(roomInput);
    if (!safeId) {
      toast.error('Invalid Room ID format.');
      return;
    }
    joinRoom(safeId);
  };

  const handleSendChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  const formatTimerDisplay = (sec: number | null) => {
    if (sec === null || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // STAGE 1: DEDICATED LOBBY DASHBOARD (When not inside an active room)
  if (!roomId && !roomParam) {
    return (
      <div
        className={`min-h-screen flex flex-col font-sans transition-colors ${
          isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
        }`}
      >
        {/* Room Disbanded Pop-up Modal for Guests */}
        {wasDisbandedByHost && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                  <Info className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold m-0 font-sans">Room Disbanded by Host</h3>
                  <p className="text-xs text-zinc-400 m-0">Session Ended</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 m-0 leading-relaxed font-mono">
                The host has disbanded this live pair coding room. All peers were disconnected and the link is no longer valid.
              </p>

              <button
                type="button"
                onClick={() => {
                  setWasDisbandedByHost(false);
                  const cleanUrl = window.location.pathname;
                  window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Back to Live Lobby
              </button>
            </div>
          </div>
        )}

        {/* Upfront Username Modal for Incoming URL Share Links */}
        {isPendingUrlJoinModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold m-0 font-sans">Enter Display Name to Join</h3>
                  <p className="text-xs text-zinc-400 m-0">Joining Room: {roomParam}</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const finalName = urlUsernameInput.trim() || 'Anonymous';
                  setUsername(finalName);
                  setIsPendingUrlJoinModalOpen(false);
                  if (roomParam) {
                    const safeId = sanitizeRoomId(roomParam);
                    if (safeId) joinRoom(safeId);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  autoFocus
                  value={urlUsernameInput}
                  onChange={(e) => setUrlUsernameInput(e.target.value)}
                  placeholder="Enter your name (e.g. Putra)"
                  className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none focus:border-zinc-600"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Join Room Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Room Not Found Error Modal */}
        {roomNotFoundError && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                  <Info className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold m-0 font-sans">Room Not Found or Invalid</h3>
                  <p className="text-xs text-zinc-400 m-0">Live Pair Coding Room</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 m-0 leading-relaxed font-mono">
                {roomNotFoundError}
              </p>

              <button
                type="button"
                onClick={() => {
                  setRoomNotFoundError(null);
                  const cleanUrl = window.location.pathname;
                  window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Dismiss & Back to Lobby
              </button>
            </div>
          </div>
        )}

        {/* Lobby Header */}
        <header className="w-full border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold no-underline transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
              <Users className="w-4 h-4 text-zinc-300" />
              <span className="text-xs font-bold tracking-tight font-sans">Live Pair Room Dashboard</span>
            </div>
          </div>
        </header>

        {/* Main Lobby Container */}
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col gap-6 justify-center">
          <div className="text-center flex flex-col gap-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight m-0">Live Pair Coding Room</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto m-0">
              Code together in real-time with P2P WebRTC. Instant code sync, live chat, and sprint timers with zero setup required.
            </p>
          </div>

          {/* User Display Name Box */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-xl flex flex-col gap-2">
            <label className="text-xs font-bold flex items-center gap-1.5 text-zinc-300">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Your Display Name / Username</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name (e.g. Putra)"
              className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </div>

          {/* 2-Card Action Grid: Create Room vs Join Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Create Live Room */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/90 shadow-2xl flex flex-col justify-between gap-5 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold m-0 font-sans">Create & Host Room</h3>
                </div>

                {/* Starter Code Template Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400">Starter Code Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 outline-none"
                  >
                    {SNIPPET_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} ({tpl.language})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sprint Timer Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
                    <span>Sprint Countdown Timer</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {selectedTimerPreset > 0 ? `${selectedTimerPreset / 60} Mins` : 'Unlimited'}
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[180, 300, 600, 0].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedTimerPreset(sec)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedTimerPreset === sec
                            ? 'bg-amber-500 text-black border-amber-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {sec > 0 ? `${sec / 60}m` : 'Off'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateRoomFromLobby}
                disabled={isConnecting}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isConnecting ? 'Connecting...' : 'Launch Live Room'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Card 2: Join Existing Room */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/90 shadow-2xl flex flex-col justify-between gap-5 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <Code className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold m-0 font-sans">Join Existing Room</h3>
                </div>

                <p className="text-xs text-zinc-400 m-0 leading-relaxed">
                  Enter the Room ID shared by your friend to join their active session.
                </p>

                <form onSubmit={handleJoinRoomFromLobby} className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="Enter Room ID (e.g. cm-abc123)"
                    className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none focus:border-zinc-600"
                  />

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 rounded-2xl text-xs font-bold border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isConnecting ? 'Connecting...' : 'Join Room'}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>100% P2P Encrypted & Protected against XSS attacks.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLeaveOrDisbandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHost) {
      setIsDisbandModalOpen(true);
    } else {
      setIsLeaveModalOpen(true);
    }
  };

  const handleConfirmDisband = () => {
    setIsDisbandModalOpen(false);
    disbandRoom();
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    leaveRoom();
  };

  // STAGE 2: ACTIVE LIVE ROOM WORKSPACE (When inside a live room)
  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* Host Room Created Info Modal */}
      {isCreatedRoomModalOpen && roomId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold m-0 font-sans">Live Room Created & Ready!</h3>
                <p className="text-xs text-zinc-400 m-0">Share this Room Code with your team</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Room Code</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono font-bold text-emerald-300 tracking-wider select-all">{roomId}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(roomId);
                    toast.success('Room Code copied!');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Share Link</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreatedRoomModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Enter Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Not Found Error Modal */}
      {roomNotFoundError && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <Info className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 font-sans">Room Not Found or Invalid</h3>
                <p className="text-xs text-zinc-400 m-0">Live Pair Coding Room</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 m-0 leading-relaxed font-mono">
              {roomNotFoundError}
            </p>

            <button
              type="button"
              onClick={() => {
                setRoomNotFoundError(null);
                const cleanUrl = window.location.pathname;
                window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Back to Live Lobby
            </button>
          </div>
        </div>
      )}

      {/* Guest Leave Room Confirmation Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <Info className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 font-sans">Leave Live Room?</h3>
                <p className="text-xs text-zinc-400 m-0">Collaborative Session</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 m-0 leading-relaxed font-mono">
              Are you sure you want to leave this live room? You will be disconnected from the collaborative workspace.
            </p>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Host Disband Room Confirmation Modal */}
      {isDisbandModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <Info className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 font-sans">Disband Live Room?</h3>
                <p className="text-xs text-zinc-400 m-0">You are the host of this room.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 m-0 leading-relaxed font-mono">
              Are you sure you want to disband this session? All connected peers will be disconnected and this room link will be permanently invalidated.
            </p>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsDisbandModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisband}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all cursor-pointer"
              >
                Disband Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Room Top Navbar */}
      <header
        className={`w-full border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl ${
          isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-zinc-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/live"
            onClick={handleLeaveOrDisbandClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold no-underline transition-all ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHost ? 'Disband Room' : 'Leave Room'}</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 border-l border-zinc-800 pl-3">
            <Users className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-mono font-bold">Room: {roomId}</span>
          </div>
        </div>

        {/* Room Header Controls */}
        <div className="flex items-center gap-2">
          {/* User Name Input Tag (Dynamically Editable Inside Active Room!) */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
            }`}
            title="Edit your display name"
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

          {/* Connected Peers Status Badge (Real-Time Counter) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{connectedPeerCount + 1} Connected</span>
          </div>

          {/* Copy Share Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share Link'}</span>
          </button>
        </div>
      </header>

      {/* Main Dedicated Workspace */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Column: Canvas + Peer Cursors Line Badge Ribbon */}
        <div
          className={`lg:col-span-8 h-full overflow-y-auto min-h-0 flex flex-col items-center p-4 sm:p-6 relative ${
            isDark ? 'bg-zinc-950/40' : 'bg-zinc-100/40'
          }`}
        >
          {/* Peer Active Line & Variable Callout Badge (Clean Obsidian Style, No Emojis) */}
          {peerCursors.size > 0 && (
            <div className="w-full max-w-3xl mb-3 flex flex-wrap gap-2.5 items-center justify-center">
              {Array.from(peerCursors.values()).map((peer) => {
                const codeLines = activeTab?.code ? activeTab.code.split('\n') : [];
                const activeLineCode = codeLines[peer.line]?.trim() || '';

                return (
                  <div
                    key={peer.peerId}
                    className="px-4 py-2 rounded-2xl bg-zinc-950/95 border border-emerald-500/40 shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all text-xs font-mono whitespace-nowrap flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="font-bold text-emerald-300">{peer.username || 'Anonymous'}</span>
                    </div>
                    <div className="h-3.5 w-px bg-zinc-800 flex-shrink-0" />
                    <div className="text-zinc-400 flex-shrink-0">
                      Line <span className="text-zinc-200 font-semibold">{peer.line + 1}</span>
                    </div>
                    {activeLineCode && (
                      <div className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] max-w-xs truncate font-mono">
                        {activeLineCode}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Canvas Container */}
          <div className="w-full flex-1 flex items-center justify-center my-auto">
            <Canvas
              settings={settings}
              setSettings={setSettings}
              peerCursors={peerCursors}
              onCursorChange={broadcastCursor}
            />
          </div>
        </div>

        {/* Right Column: Collapsible Sidebar (Live Chat vs Settings) */}
        <div className="lg:col-span-4 h-full overflow-y-auto min-h-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
          {/* Sidebar Tab Toggle Header */}
          <div className="p-2 border-b border-zinc-800 grid grid-cols-2 gap-1 bg-zinc-900/60">
            <button
              onClick={() => setActiveSidebarTab('chat')}
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'chat'
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-transparent text-zinc-400 border-transparent hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('settings')}
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'settings'
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-transparent text-zinc-400 border-transparent hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme & Style</span>
            </button>
          </div>

          {/* Tab 1: Live Chat / System Event Notes Panel */}
          {activeSidebarTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 justify-between gap-3">
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-xs text-zinc-500 my-auto flex flex-col gap-1">
                    <MessageSquare className="w-6 h-6 text-zinc-600 mx-auto" />
                    <span>No messages yet. Start typing to chat!</span>
                  </div>
                ) : (
                  chatMessages.map((msg) =>
                    msg.isSystem ? (
                      /* System Event Message Pill */
                      <div
                        key={msg.id}
                        className="py-1 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 text-center my-1 flex items-center justify-center gap-1.5"
                      >
                        <Info className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      /* User Chat Message Bubble */
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-200">{msg.sender}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{msg.time}</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-mono m-0 whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )
                  )
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none focus:border-zinc-700"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Control Panel Settings */}
          {activeSidebarTab === 'settings' && (
            <div className="flex-1 overflow-y-auto min-h-0">
              <ControlPanel settings={settings} setSettings={setSettings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

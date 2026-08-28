import { useState, useRef, useCallback } from 'react';
import Peer from 'peerjs';
type DataConnection = ReturnType<InstanceType<typeof Peer>['connect']>;
import type { SnippetSettings, SupportedLanguage } from '../types';
import { sanitizeRoomId, sanitizeText } from '../utils/security';
import { toast } from 'sonner';

export interface PeerCursorInfo {
  peerId: string;
  username: string;
  line: number;
  ch: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface PeerStatePayload {
  type:
    | 'SYNC_STATE'
    | 'REQUEST_SYNC'
    | 'CODE_CHANGE'
    | 'SETTING_CHANGE'
    | 'TIMER_START'
    | 'TIMER_TICK'
    | 'CURSOR_MOVE'
    | 'USER_JOIN'
    | 'USER_LEAVE'
    | 'USERNAME_CHANGE'
    | 'ROOM_DISBANDED'
    | 'PEER_COUNT_UPDATE'
    | 'CHAT_MESSAGE';
  senderId: string;
  username?: string;
  code?: string;
  tabId?: string;
  title?: string;
  language?: SupportedLanguage;
  settings?: Partial<SnippetSettings>;
  timerSeconds?: number;
  totalMembers?: number;
  line?: number;
  ch?: number;
  chatText?: string;
  timestamp?: number;
}

interface UseLivePairRoomProps {
  settings: SnippetSettings;
  updateSetting: <K extends keyof SnippetSettings>(key: K, value: SnippetSettings[K]) => void;
  updateActiveTabCode: (code: string, tabId?: string, title?: string, language?: SupportedLanguage) => void;
}

export const useLivePairRoom = ({
  settings,
  updateSetting,
  updateActiveTabCode,
}: UseLivePairRoomProps) => {
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string>(() => {
    return localStorage.getItem('codemotion_live_username') || 'Anonymous';
  });
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedPeerCount, setConnectedPeerCount] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [peerCursors, setPeerCursors] = useState<Map<string, PeerCursorInfo>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [roomNotFoundError, setRoomNotFoundError] = useState<string | null>(null);
  const [wasDisbandedByHost, setWasDisbandedByHost] = useState<boolean>(false);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const peerIdRef = useRef<string>('');
  const isHostRef = useRef<boolean>(false);
  const isRemoteChangeRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const peerUsernamesRef = useRef<Map<string, string>>(new Map());

  // Broadcast state payload to all connected peers
  const broadcastPayload = useCallback((payload: PeerStatePayload) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }, []);

  // Update username dynamically inside active room & broadcast update
  const setUsername = useCallback(
    (name: string) => {
      const cleanName = sanitizeText(name || 'Anonymous', 30).trim() || 'Anonymous';
      setUsernameState(cleanName);
      localStorage.setItem('codemotion_live_username', cleanName);

      if (isConnected && connectionsRef.current.size > 0) {
        broadcastPayload({
          type: 'USERNAME_CHANGE',
          senderId: peerIdRef.current,
          username: cleanName,
        });
      }
    },
    [broadcastPayload, isConnected]
  );

  // Reset 1-Minute Inactivity Session Expiration Timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  // Add System Event Chat Message
  const addSystemChatMessage = useCallback((text: string) => {
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}-${Math.random()}`,
      sender: 'System',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);
  }, []);

  // Leave room and invalidate session
  const leaveRoom = useCallback(() => {
    resetInactivityTimer();
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    connectionsRef.current.clear();
    peerUsernamesRef.current.clear();
    setRoomId(null);
    setIsHost(false);
    isHostRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    setConnectedPeerCount(0);
    setTimerSeconds(null);
    setIsTimerActive(false);
    setPeerCursors(new Map());
    setChatMessages([]);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const cleanUrl = window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  }, [resetInactivityTimer]);

  // Host Disband Room (broadcasts ROOM_DISBANDED payload to all peers and invalidates room link)
  const disbandRoom = useCallback(() => {
    if (isConnected && connectionsRef.current.size > 0) {
      broadcastPayload({
        type: 'ROOM_DISBANDED',
        senderId: peerIdRef.current,
      });
    }
    leaveRoom();
    toast.info('Live Room disbanded. The room link has been invalidated.');
  }, [broadcastPayload, isConnected, leaveRoom]);

  // Handle incoming data payload from a peer + Relay if Host
  const handleIncomingPayload = useCallback(
    (payload: PeerStatePayload) => {
      if (payload.senderId === peerIdRef.current) return;

      // Host Relay: Forward payload to all other connected peers
      if (isHostRef.current) {
        connectionsRef.current.forEach((conn, pId) => {
          if (pId !== payload.senderId && conn.open) {
            conn.send(payload);
          }
        });
      }

      switch (payload.type) {
        case 'REQUEST_SYNC':
          if (isHostRef.current) {
            const curSettings = settingsRef.current;
            const activeTab = curSettings.tabs.find((t) => t.id === curSettings.activeTabId) || curSettings.tabs[0];
            broadcastPayload({
              type: 'SYNC_STATE',
              senderId: peerIdRef.current,
              username: username,
              tabId: curSettings.activeTabId,
              title: activeTab?.title,
              code: activeTab?.code || '',
              language: activeTab?.language || 'typescript',
              timerSeconds: timerSeconds || undefined,
              settings: {
                theme: curSettings.theme,
                background: curSettings.background,
                fontFamily: curSettings.fontFamily,
                fontSize: curSettings.fontSize,
                diffMode: curSettings.diffMode,
                windowStyle: curSettings.windowStyle,
              },
            });
          }
          break;

        case 'SYNC_STATE':
        case 'CODE_CHANGE':
          if (payload.code !== undefined) {
            const safeCode = sanitizeText(payload.code, 50000);
            isRemoteChangeRef.current = true;
            updateActiveTabCode(safeCode, payload.tabId, payload.title, payload.language);
            setTimeout(() => {
              isRemoteChangeRef.current = false;
            }, 50);
          }
          if (payload.settings) {
            Object.entries(payload.settings).forEach(([k, v]) => {
              updateSetting(k as keyof SnippetSettings, v);
            });
          }
          break;

        case 'SETTING_CHANGE':
          if (payload.settings) {
            Object.entries(payload.settings).forEach(([k, v]) => {
              updateSetting(k as keyof SnippetSettings, v);
            });
          }
          break;

        case 'PEER_COUNT_UPDATE':
          if (payload.totalMembers !== undefined) {
            setConnectedPeerCount(Math.max(0, payload.totalMembers - 1));
          }
          break;

        case 'USER_JOIN':
          if (payload.username) {
            peerUsernamesRef.current.set(payload.senderId, payload.username);
            addSystemChatMessage(`${payload.username} joined the Live Room.`);
          }
          break;

        case 'USERNAME_CHANGE':
          if (payload.username) {
            const oldName = peerUsernamesRef.current.get(payload.senderId) || 'Peer';
            peerUsernamesRef.current.set(payload.senderId, payload.username);
            addSystemChatMessage(`${oldName} changed name to ${payload.username}.`);

            // Update peer cursors username
            setPeerCursors((prev) => {
              const updated = new Map(prev);
              const existing = updated.get(payload.senderId);
              if (existing) {
                updated.set(payload.senderId, { ...existing, username: payload.username! });
              }
              return updated;
            });
          }
          break;

        case 'ROOM_DISBANDED':
          leaveRoom();
          setWasDisbandedByHost(true);
          toast.error('The host disbanded the Live Room. This room link is no longer valid.');
          break;

        case 'CHAT_MESSAGE':
          if (payload.chatText) {
            const cleanText = sanitizeText(payload.chatText, 1000);
            const msg: ChatMessage = {
              id: `${Date.now()}-${Math.random()}`,
              sender: sanitizeText(payload.username || 'Anonymous', 30),
              text: cleanText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChatMessages((prev) => [...prev, msg]);
          }
          break;

        case 'CURSOR_MOVE':
          if (payload.line !== undefined && payload.ch !== undefined) {
            const peerName = payload.username || peerUsernamesRef.current.get(payload.senderId) || 'Anonymous';
            setPeerCursors((prev) => {
              const updated = new Map(prev);
              updated.set(payload.senderId, {
                peerId: payload.senderId,
                username: sanitizeText(peerName, 30),
                line: payload.line!,
                ch: payload.ch!,
              });
              return updated;
            });
          }
          break;

        case 'TIMER_START':
          if (payload.timerSeconds !== undefined) {
            setTimerSeconds(payload.timerSeconds);
            setIsTimerActive(true);
            toast.info(`Sprint Timer started: ${Math.floor(payload.timerSeconds / 60)} minutes.`);
          }
          break;

        case 'TIMER_TICK':
          if (payload.timerSeconds !== undefined) {
            setTimerSeconds(payload.timerSeconds);
            if (payload.timerSeconds === 0) {
              setIsTimerActive(false);
              toast.success('Sprint Timer finished. Great coding session.');
            }
          }
          break;
      }
    },
    [addSystemChatMessage, leaveRoom, updateActiveTabCode, updateSetting]
  );

  // Set up connection listeners (Host & Guest sides)
  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.on('open', () => {
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
          joinTimeoutRef.current = null;
        }
        connectionsRef.current.set(conn.peer, conn);

        const totalRoomMembers = connectionsRef.current.size + 1;
        setConnectedPeerCount(connectionsRef.current.size);
        setIsConnected(true);
        setIsConnecting(false);
        resetInactivityTimer();
        setRoomNotFoundError(null);

        // Host broadcasts PEER_COUNT_UPDATE to all guests
        if (isHostRef.current) {
          broadcastPayload({
            type: 'PEER_COUNT_UPDATE',
            senderId: peerIdRef.current,
            totalMembers: totalRoomMembers,
          });
        }

        toast.success('Peer connected to Live Room.');

        // Send USER_JOIN notification payload
        conn.send({
          type: 'USER_JOIN',
          senderId: peerIdRef.current,
          username: username,
        });

        // Guest sends REQUEST_SYNC to Host immediately
        if (!isHostRef.current) {
          conn.send({
            type: 'REQUEST_SYNC',
            senderId: peerIdRef.current,
          });
        }

        // Host sends current active code & state to newly joined peer (immediately + after 150ms delay)
        if (isHostRef.current) {
          const curSettings = settingsRef.current;
          const activeTab = curSettings.tabs.find((t) => t.id === curSettings.activeTabId) || curSettings.tabs[0];
          const syncPayload: PeerStatePayload = {
            type: 'SYNC_STATE',
            senderId: peerIdRef.current,
            username: username,
            tabId: curSettings.activeTabId,
            title: activeTab?.title,
            code: activeTab?.code || '',
            language: activeTab?.language || 'typescript',
            timerSeconds: timerSeconds || undefined,
            settings: {
              theme: curSettings.theme,
              background: curSettings.background,
              fontFamily: curSettings.fontFamily,
              fontSize: curSettings.fontSize,
              diffMode: curSettings.diffMode,
              windowStyle: curSettings.windowStyle,
            },
          };

          conn.send(syncPayload);
          setTimeout(() => {
            if (conn.open) conn.send(syncPayload);
          }, 150);
        }
      });

      conn.on('data', (data: any) => {
        handleIncomingPayload(data as PeerStatePayload);
      });

      conn.on('close', () => {
        const leavingPeerName = peerUsernamesRef.current.get(conn.peer) || 'A peer';
        connectionsRef.current.delete(conn.peer);
        peerUsernamesRef.current.delete(conn.peer);

        const totalRoomMembers = connectionsRef.current.size + 1;
        setConnectedPeerCount(connectionsRef.current.size);
        setPeerCursors((prev) => {
          const updated = new Map(prev);
          updated.delete(conn.peer);
          return updated;
        });

        // Host broadcasts updated peer count to remaining guests
        if (isHostRef.current) {
          broadcastPayload({
            type: 'PEER_COUNT_UPDATE',
            senderId: peerIdRef.current,
            totalMembers: totalRoomMembers,
          });
        }

        addSystemChatMessage(`${leavingPeerName} left the Live Room.`);
        toast.info(`${leavingPeerName} left the room.`);

        // If 0 peers remaining, start 60s inactivity session expiration timer
        if (connectionsRef.current.size === 0) {
          setIsConnected(false);
          resetInactivityTimer();
          inactivityTimeoutRef.current = setTimeout(() => {
            leaveRoom();
            toast.error('Room session expired: No peers connected for 1 minute.');
          }, 60000);
        }
      });
    },
    [addSystemChatMessage, broadcastPayload, handleIncomingPayload, leaveRoom, resetInactivityTimer, settings, timerSeconds, username]
  );

  // Create a new Live Pair Room
  const createRoom = useCallback(() => {
    if (isConnecting) return;
    setIsConnecting(true);
    setRoomNotFoundError(null);
    const newRoomId = `cm-${Math.random().toString(36).substring(2, 8)}`;
    const safeRoomId = sanitizeRoomId(newRoomId)!;

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const peer = new Peer(safeRoomId, { debug: 0 });
    peerRef.current = peer;

    peer.on('open', (id) => {
      peerIdRef.current = id;
      setRoomId(id);
      setIsHost(true);
      isHostRef.current = true;
      setIsConnected(true);
      setIsConnecting(false);

      const newUrl = `${window.location.pathname}?room=${id}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);

      toast.success(`Created Live Room: ${id}`);
      addSystemChatMessage(`Live Room ${id} launched by ${username}.`);

      // Start 60s inactivity expiration timer (if no guest connects within 60s)
      resetInactivityTimer();
      inactivityTimeoutRef.current = setTimeout(() => {
        if (connectionsRef.current.size === 0) {
          leaveRoom();
          toast.error('Room session expired: No peers connected for 1 minute.');
        }
      }, 60000);
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('PeerJS create error:', err);
      setIsConnecting(false);
      toast.error('Connection error: ' + err.message);
    });
  }, [addSystemChatMessage, isConnecting, leaveRoom, resetInactivityTimer, setupConnection, username]);

  // Join an existing Live Pair Room
  const joinRoom = useCallback(
    (targetRoomId: string) => {
      if (isConnecting) return;
      setRoomNotFoundError(null);
      const safeRoomId = sanitizeRoomId(targetRoomId);
      if (!safeRoomId) {
        setRoomNotFoundError(`Invalid Room ID format: '${targetRoomId}'.`);
        return;
      }

      setIsConnecting(true);
      setRoomId(safeRoomId);
      setIsHost(false);
      isHostRef.current = false;

      const newUrl = `${window.location.pathname}?room=${safeRoomId}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);

      if (peerRef.current) {
        peerRef.current.destroy();
      }

      const peer = new Peer({ debug: 0 });
      peerRef.current = peer;

      peer.on('open', (id) => {
        peerIdRef.current = id;

        const conn = peer.connect(safeRoomId, { reliable: true });
        setupConnection(conn);

        // 15-Second Connection Timeout for Room Existence Validation
        if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = setTimeout(() => {
          if (!connectionsRef.current.get(safeRoomId)?.open) {
            leaveRoom();
            setRoomNotFoundError(`Room ID '${safeRoomId}' was not found, is offline, or has ended.`);
          }
        }, 15000);
      });

      peer.on('error', (err) => {
        console.error('PeerJS join error:', err);
        leaveRoom();
        setRoomNotFoundError(`Room ID '${safeRoomId}' was not found or has already ended.`);
      });
    },
    [isConnecting, leaveRoom, setupConnection]
  );

  // Send P2P Chat Message
  const sendChatMessage = useCallback(
    (text: string) => {
      const cleanText = sanitizeText(text, 1000).trim();
      if (!cleanText) return;

      const myMsg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        sender: username || 'You',
        text: cleanText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, myMsg]);

      if (isConnected) {
        broadcastPayload({
          type: 'CHAT_MESSAGE',
          senderId: peerIdRef.current,
          username: username,
          chatText: cleanText,
        });
      }
    },
    [broadcastPayload, isConnected, username]
  );

  // Broadcast code changes (ignoring remote-triggered updates to prevent glitch loops)
  const broadcastCodeChange = useCallback(
    (code: string, tabId?: string) => {
      if (!isConnected || connectionsRef.current.size === 0 || isRemoteChangeRef.current) return;
      const safeCode = sanitizeText(code, 50000);
      const curSettings = settingsRef.current;
      const activeTab = curSettings.tabs.find((t) => t.id === (tabId || curSettings.activeTabId)) || curSettings.tabs[0];

      broadcastPayload({
        type: 'CODE_CHANGE',
        senderId: peerIdRef.current,
        username: username,
        tabId: tabId || curSettings.activeTabId,
        title: activeTab?.title,
        language: activeTab?.language,
        code: safeCode,
      });
    },
    [broadcastPayload, isConnected, username]
  );

  // Broadcast setting changes
  const broadcastSettingChange = useCallback(
    (newSettings: Partial<SnippetSettings>) => {
      if (!isConnected || connectionsRef.current.size === 0) return;
      broadcastPayload({
        type: 'SETTING_CHANGE',
        senderId: peerIdRef.current,
        username: username,
        settings: newSettings,
      });
    },
    [broadcastPayload, isConnected, username]
  );

  // Broadcast cursor position
  const broadcastCursor = useCallback(
    (line: number, ch: number) => {
      if (!isConnected || connectionsRef.current.size === 0) return;
      broadcastPayload({
        type: 'CURSOR_MOVE',
        senderId: peerIdRef.current,
        username: username,
        line,
        ch,
      });
    },
    [broadcastPayload, isConnected, username]
  );

  // Start Sprint Countdown Timer
  const startSprintTimer = useCallback(
    (seconds: number) => {
      setTimerSeconds(seconds);
      setIsTimerActive(true);

      broadcastPayload({
        type: 'TIMER_START',
        senderId: peerIdRef.current,
        timerSeconds: seconds,
      });

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      let current = seconds;
      timerIntervalRef.current = setInterval(() => {
        current -= 1;
        setTimerSeconds(current);

        if (current <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setIsTimerActive(false);
          toast.success('Sprint Timer finished.');
        }
      }, 1000);
    },
    [broadcastPayload]
  );

  return {
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
  };
};

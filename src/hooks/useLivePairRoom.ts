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
    | 'CODE_CHANGE'
    | 'SETTING_CHANGE'
    | 'TIMER_START'
    | 'TIMER_TICK'
    | 'CURSOR_MOVE'
    | 'USER_JOIN'
    | 'USER_LEAVE'
    | 'USERNAME_CHANGE'
    | 'CHAT_MESSAGE';
  senderId: string;
  username?: string;
  code?: string;
  tabId?: string;
  title?: string;
  language?: SupportedLanguage;
  settings?: Partial<SnippetSettings>;
  timerSeconds?: number;
  line?: number;
  ch?: number;
  chatText?: string;
  timestamp?: number;
}

interface UseLivePairRoomProps {
  settings: SnippetSettings;
  updateSetting: <K extends keyof SnippetSettings>(key: K, value: SnippetSettings[K]) => void;
  updateActiveTabCode: (code: string, tabId?: string) => void;
}

export const useLivePairRoom = ({
  settings,
  updateSetting,
  updateActiveTabCode,
}: UseLivePairRoomProps) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string>(() => {
    return localStorage.getItem('codemotion_live_username') || 'Anonymous';
  });
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedPeerCount, setConnectedPeerCount] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [peerCursors, setPeerCursors] = useState<Map<string, PeerCursorInfo>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const peerIdRef = useRef<string>('');
  const isHostRef = useRef<boolean>(false);
  const isRemoteChangeRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
        case 'SYNC_STATE':
        case 'CODE_CHANGE':
          if (payload.code !== undefined) {
            const safeCode = sanitizeText(payload.code, 50000);
            isRemoteChangeRef.current = true;
            updateActiveTabCode(safeCode, payload.tabId);
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
    [addSystemChatMessage, updateActiveTabCode, updateSetting]
  );

  // Set up connection listeners (Host & Guest sides)
  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.on('open', () => {
        connectionsRef.current.set(conn.peer, conn);
        setConnectedPeerCount(connectionsRef.current.size);
        setIsConnected(true);
        resetInactivityTimer();
        toast.success('Peer connected to Live Room.');

        // Send USER_JOIN notification payload
        conn.send({
          type: 'USER_JOIN',
          senderId: peerIdRef.current,
          username: username,
        });

        // Send current active code & username to newly joined peer
        const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];
        conn.send({
          type: 'SYNC_STATE',
          senderId: peerIdRef.current,
          username: username,
          tabId: settings.activeTabId,
          code: activeTab?.code || '',
          language: activeTab?.language || 'typescript',
          timerSeconds: timerSeconds || undefined,
          settings: {
            theme: settings.theme,
            background: settings.background,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            diffMode: settings.diffMode,
            windowStyle: settings.windowStyle,
          },
        });
      });

      conn.on('data', (data: any) => {
        handleIncomingPayload(data as PeerStatePayload);
      });

      conn.on('close', () => {
        const leavingPeerName = peerUsernamesRef.current.get(conn.peer) || 'A peer';
        connectionsRef.current.delete(conn.peer);
        peerUsernamesRef.current.delete(conn.peer);

        setConnectedPeerCount(connectionsRef.current.size);
        setPeerCursors((prev) => {
          const updated = new Map(prev);
          updated.delete(conn.peer);
          return updated;
        });

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
    [addSystemChatMessage, handleIncomingPayload, leaveRoom, resetInactivityTimer, settings, timerSeconds, username]
  );

  // Create a new Live Pair Room
  const createRoom = useCallback(() => {
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
      console.error('PeerJS error:', err);
      toast.error('Connection error: ' + err.message);
    });
  }, [addSystemChatMessage, leaveRoom, resetInactivityTimer, setupConnection, username]);

  // Join an existing Live Pair Room
  const joinRoom = useCallback(
    (targetRoomId: string) => {
      const safeRoomId = sanitizeRoomId(targetRoomId);
      if (!safeRoomId) {
        toast.error('Invalid Room ID format.');
        return;
      }

      if (peerRef.current) {
        peerRef.current.destroy();
      }

      const peer = new Peer({ debug: 0 });
      peerRef.current = peer;

      peer.on('open', (id) => {
        peerIdRef.current = id;
        setRoomId(safeRoomId);
        setIsHost(false);
        isHostRef.current = false;

        const newUrl = `${window.location.pathname}?room=${safeRoomId}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        const conn = peer.connect(safeRoomId);
        setupConnection(conn);
      });

      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        toast.error('Could not connect to Room: ' + safeRoomId);
      });
    },
    [setupConnection]
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
      broadcastPayload({
        type: 'CODE_CHANGE',
        senderId: peerIdRef.current,
        username: username,
        tabId: tabId || settings.activeTabId,
        code: safeCode,
      });
    },
    [broadcastPayload, isConnected, settings.activeTabId, username]
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
    connectedPeerCount,
    timerSeconds,
    isTimerActive,
    peerCursors,
    chatMessages,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    broadcastCodeChange,
    broadcastSettingChange,
    broadcastCursor,
    startSprintTimer,
  };
};

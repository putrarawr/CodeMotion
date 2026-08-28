import { useState, useRef, useCallback } from 'react';
import Peer from 'peerjs';
type DataConnection = ReturnType<InstanceType<typeof Peer>['connect']>;
import type { SnippetSettings, SupportedLanguage, SupportedTheme } from '../types';
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
}

export interface PeerStatePayload {
  type: 'SYNC_STATE' | 'CODE_CHANGE' | 'SETTING_CHANGE' | 'TIMER_START' | 'TIMER_TICK' | 'CURSOR_MOVE' | 'USER_JOIN' | 'CHAT_MESSAGE';
  senderId: string;
  username?: string;
  code?: string;
  title?: string;
  language?: SupportedLanguage;
  theme?: SupportedTheme;
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
  updateActiveTabCode: (code: string) => void;
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
  const isRemoteChangeRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const setUsername = (name: string) => {
    const cleanName = sanitizeText(name || 'Anonymous', 30).trim() || 'Anonymous';
    setUsernameState(cleanName);
    localStorage.setItem('codemotion_live_username', cleanName);
  };

  // Broadcast state payload to all connected peers
  const broadcastPayload = useCallback((payload: PeerStatePayload) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }, []);

  // Handle incoming data payload from a peer
  const handleIncomingPayload = useCallback(
    (payload: PeerStatePayload) => {
      if (payload.senderId === peerIdRef.current) return;

      switch (payload.type) {
        case 'SYNC_STATE':
        case 'CODE_CHANGE':
          if (payload.code !== undefined) {
            const safeCode = sanitizeText(payload.code, 50000);
            isRemoteChangeRef.current = true;
            updateActiveTabCode(safeCode);
            setTimeout(() => {
              isRemoteChangeRef.current = false;
            }, 50);
          }
          if (payload.theme) updateSetting('theme', payload.theme);
          break;

        case 'SETTING_CHANGE':
          if (payload.theme) updateSetting('theme', payload.theme);
          if (payload.settings) {
            Object.entries(payload.settings).forEach(([k, v]) => {
              updateSetting(k as keyof SnippetSettings, v);
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
            setPeerCursors((prev) => {
              const updated = new Map(prev);
              updated.set(payload.senderId, {
                peerId: payload.senderId,
                username: sanitizeText(payload.username || 'Anonymous', 30),
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
    [updateActiveTabCode, updateSetting]
  );

  // Set up connection listeners
  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.on('open', () => {
        connectionsRef.current.set(conn.peer, conn);
        setConnectedPeerCount(connectionsRef.current.size);
        setIsConnected(true);
        toast.success('Peer connected to Live Coding Room.');

        // Send current active code & username to newly joined peer
        const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];
        conn.send({
          type: 'SYNC_STATE',
          senderId: peerIdRef.current,
          username: username,
          code: activeTab?.code || '',
          language: activeTab?.language || 'typescript',
          theme: settings.theme,
          timerSeconds: timerSeconds || undefined,
        });
      });

      conn.on('data', (data: any) => {
        handleIncomingPayload(data as PeerStatePayload);
      });

      conn.on('close', () => {
        connectionsRef.current.delete(conn.peer);
        setConnectedPeerCount(connectionsRef.current.size);
        setPeerCursors((prev) => {
          const updated = new Map(prev);
          updated.delete(conn.peer);
          return updated;
        });
        if (connectionsRef.current.size === 0) {
          setIsConnected(false);
        }
        toast.info('Peer disconnected from room.');
      });
    },
    [handleIncomingPayload, settings, timerSeconds, username]
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
      setIsConnected(true);

      const newUrl = `${window.location.pathname}?room=${id}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);

      toast.success(`Created Live Room: ${id}`);
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      toast.error('Connection error: ' + err.message);
    });
  }, [setupConnection]);

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

  // Leave current room
  const leaveRoom = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    connectionsRef.current.clear();
    setRoomId(null);
    setIsHost(false);
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
    toast.info('Left Live Pair Room.');
  }, []);

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
    (code: string) => {
      if (!isConnected || connectionsRef.current.size === 0 || isRemoteChangeRef.current) return;
      const safeCode = sanitizeText(code, 50000);
      broadcastPayload({
        type: 'CODE_CHANGE',
        senderId: peerIdRef.current,
        username: username,
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

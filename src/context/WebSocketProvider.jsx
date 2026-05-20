import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * WebSocketContext — Global STOMP connection manager.
 * Provides connect/disconnect/send/subscribe API to all child components.
 * Token is attached from localStorage so auth is preserved.
 */

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
};

export const WebSocketProvider = ({ children }) => {
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({}); // { destinaton: StompSubscription }
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    const token = localStorage.getItem('auth_token');

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        setReconnecting(false);
        console.log('[WS] Connected to STOMP broker');
      },

      onDisconnect: () => {
        setConnected(false);
        console.log('[WS] Disconnected from STOMP broker');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers?.message);
        setReconnecting(true);
      },

      onWebSocketClose: () => {
        setConnected(false);
        setReconnecting(true);
      },
    });

    client.activate();
    clientRef.current = client;
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
      subscriptionsRef.current = {};
    }
  }, []);

  /**
   * Subscribe to a STOMP destination.
   * Returns an unsubscribe function.
   */
  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current?.connected) {
      console.warn('[WS] Cannot subscribe — not connected:', destination);
      return () => {};
    }

    // Unsubscribe previous subscription to same destination
    if (subscriptionsRef.current[destination]) {
      subscriptionsRef.current[destination].unsubscribe();
    }

    const sub = clientRef.current.subscribe(destination, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch (e) {
        callback(message.body);
      }
    });

    subscriptionsRef.current[destination] = sub;

    return () => {
      sub.unsubscribe();
      delete subscriptionsRef.current[destination];
    };
  }, []);

  /**
   * Unsubscribe from a specific destination.
   */
  const unsubscribe = useCallback((destination) => {
    if (subscriptionsRef.current[destination]) {
      subscriptionsRef.current[destination].unsubscribe();
      delete subscriptionsRef.current[destination];
    }
  }, []);

  /**
   * Send a message to a STOMP destination.
   */
  const send = useCallback((destination, body = {}) => {
    if (!clientRef.current?.connected) {
      console.warn('[WS] Cannot send — not connected:', destination);
      return;
    }
    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, reconnecting, connect, disconnect, subscribe, unsubscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

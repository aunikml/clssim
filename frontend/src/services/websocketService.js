class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.sessionId = null;
    this.isConnected = false;
  }

  connect(sessionId) {
    this.sessionId = sessionId;
    const token = localStorage.getItem('access_token');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.hostname || 'localhost';
    const port = import.meta.env.VITE_WS_PORT || '8000';
    const url = `${wsProtocol}//${host}:${port}/ws/classrooms/sessions/${sessionId}/${token ? `?token=${token}` : ''}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notify('connection_change', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event) {
            this.notify(data.event, data);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notify('connection_change', { status: 'disconnected' });
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(this.sessionId), 2000 * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket encountered error:', error);
      };
    } catch (e) {
      console.warn('WebSocket connection attempt failed:', e);
    }
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }

  notify(eventName, data) {
    if (this.listeners.has(eventName)) {
      for (const callback of this.listeners.get(eventName)) {
        callback(data);
      }
    }
    // Wildcard subscriber
    if (this.listeners.has('*')) {
      for (const callback of this.listeners.get('*')) {
        callback(eventName, data);
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const websocketService = new WebSocketService();

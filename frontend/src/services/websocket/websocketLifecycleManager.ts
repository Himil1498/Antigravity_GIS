
import { WebSocketMessage } from "./types";

/**
 * Manages WebSocket connection lifecycle events
 * including heartbeats, reconnection attempts, and connection monitoring.
 */
export class WebSocketLifecycleManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  // Callbacks provided by the main service
  private connectFn: () => Promise<boolean>;
  private isConnectedFn: () => boolean;
  private sendMessageFn: (msg: WebSocketMessage) => boolean;
  private notifyListenersFn: (connected: boolean) => void;

  constructor(
    connectFn: () => Promise<boolean>,
    isConnectedFn: () => boolean,
    sendMessageFn: (msg: WebSocketMessage) => boolean,
    notifyListenersFn: (connected: boolean) => void
  ) {
    this.connectFn = connectFn;
    this.isConnectedFn = isConnectedFn;
    this.sendMessageFn = sendMessageFn;
    this.notifyListenersFn = notifyListenersFn;
  }

  /**
   * Reset reconnect counters on successful connection
   */
  public handleConnectionSuccess(): void {
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.notifyListenersFn(true);
  }

  /**
   * Handle connection close event
   */
  public handleConnectionClose(code: number): void {
    this.notifyListenersFn(false);
    this.stopHeartbeat();

    // Attempt reconnection for certain close codes
    // 1000: Normal Closure, 1001: Going Away
    if (
      code !== 1000 &&
      code !== 1001 &&
      this.reconnectAttempts < this.maxReconnectAttempts
    ) {
      this.scheduleReconnect();
    } else {
      console.log("🔌 WebSocket connection permanently closed");
    }
  }

  /**
   * Handle connection error event
   */
  public handleConnectionError(): void {
    this.notifyListenersFn(false);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(
      `🔄 Scheduling WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(async () => {
      if (!this.isConnectedFn()) {
        await this.connectFn();
      }
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnectedFn()) {
        this.sendMessageFn({
          type: "ping",
          event: "heartbeat",
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // 30s
  }

  /**
   * Stop heartbeat mechanism
   */
  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Manual cleanup
   */
  public cleanup(): void {
    this.stopHeartbeat();
    this.reconnectAttempts = 0;
  }
}


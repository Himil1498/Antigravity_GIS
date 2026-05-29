
import { WebSocketMessage } from "./types";
import { establishWebSocketConnection } from "./websocketConnectionHelper";
import { SubscriptionManager } from "./websocketSubscriptionManager";
import { handleGlobalMessages } from "./websocketGlobalMessageHandler";
import { WebSocketLifecycleManager } from "./websocketLifecycleManager";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private subscriptionManager: SubscriptionManager;
  private lifecycleManager: WebSocketLifecycleManager;
  private isConnecting = false;
  private isAuthenticated = false;
  private connectionListeners: Array<(connected: boolean) => void> = [];

  constructor() {
    console.log("🔌 WebSocket Service initialized");
    this.subscriptionManager = new SubscriptionManager(
      this.sendMessage.bind(this),
      this.isConnected.bind(this)
    );
    
    // Initialize Lifecycle Manager
    this.lifecycleManager = new WebSocketLifecycleManager(
      this.connect.bind(this),
      this.isConnected.bind(this),
      this.sendMessage.bind(this),
      this.notifyConnectionListeners.bind(this)
    );
  }

  /**
   * Connect to WebSocket server with authentication
   */
  async connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) return true;
    if (this.isConnecting) return false;

    try {
      this.isConnecting = true;
      console.log("🔄 Connecting to WebSocket server...");

      this.ws = await establishWebSocketConnection();

      this.setupEventHandlers();
      this.isAuthenticated = true;
      
      // Notify lifecycle manager of success
      this.lifecycleManager.handleConnectionSuccess();

      console.log("✅✅✅ WebSocket connected successfully");
      return true;
    } catch (error) {
      console.error("❌ WebSocket connection failed:", error);
      this.lifecycleManager.handleConnectionError();
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log("🔌 Disconnecting WebSocket...");

    this.lifecycleManager.cleanup();

    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }

    this.isAuthenticated = false;
    this.subscriptionManager.clear();
    this.notifyConnectionListeners(false);

    console.log("✅ WebSocket disconnected");
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("🔌 WebSocket connection closed", event.code, event.reason);
      this.isAuthenticated = false; // Immediate local update
      this.lifecycleManager.handleConnectionClose(event.code);
    };

    this.ws.onerror = (error) => {
      console.error("❌ WebSocket error occurred:", error);
      this.isAuthenticated = false;
      this.lifecycleManager.handleConnectionError();
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    if (message.type === 'pong' || message.event === 'heartbeat') {
      // Ignore log for heartbeats
    } else {
        console.log("📨 WebSocket message received:", message.type, message.event);
    }

    if (message.type === "ping") {
      this.sendMessage({
        type: "pong",
        event: "heartbeat",
        data: null,
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.subscriptionManager.handleMessage(message);
    handleGlobalMessages(message);
  }

  /**
   * Send message to WebSocket server
   */
  private sendMessage(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ Cannot send WebSocket message - not connected");
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("❌ Failed to send WebSocket message:", error);
      return false;
    }
  }

  /**
   * Api for Subscriptions
   */
  subscribe(channel: string, callback: (data: any) => void): string {
    return this.subscriptionManager.subscribe(channel, callback);
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptionManager.unsubscribe(subscriptionId);
  }

  /**
   * Connection Status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  addConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners.push(callback);
  }

  removeConnectionListener(callback: (connected: boolean) => void): void {
    const index = this.connectionListeners.indexOf(callback);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  private notifyConnectionListeners(connected: boolean): void {
    // Sync local auth state for consistency
    if (!connected) this.isAuthenticated = false;
    
    this.connectionListeners.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error("❌ Error in connection listener:", error);
      }
    });
  }
}

export const websocketService = new WebSocketService();
export default websocketService;


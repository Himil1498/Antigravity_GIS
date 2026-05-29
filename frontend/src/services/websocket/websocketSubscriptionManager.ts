
import { WebSocketMessage, WebSocketSubscription } from "./types";

/**
 * WebSocket Subscription Manager
 * Handles channel subscriptions and message routing
 */
export class SubscriptionManager {
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private sendCallback: (message: any) => boolean;
  private isConnectedCallback: () => boolean;

  constructor(
    sendCallback: (message: any) => boolean,
    isConnectedCallback: () => boolean
  ) {
    this.sendCallback = sendCallback;
    this.isConnectedCallback = isConnectedCallback;
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string, callback: (data: any) => void): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel,
      callback
    });

    // Send subscription request to server
    if (this.isConnectedCallback()) {
      this.sendCallback({
        type: "subscribe",
        event: "channel_subscription",
        data: { channel },
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔔 Subscribed to channel: ${channel} (${subscriptionId})`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      // Send unsubscription request to server
      if (this.isConnectedCallback()) {
        this.sendCallback({
          type: "unsubscribe",
          event: "channel_unsubscription",
          data: { channel: subscription.channel },
          timestamp: new Date().toISOString()
        });
      }

      this.subscriptions.delete(subscriptionId);
      console.log(
        `🔕 Unsubscribed from channel: ${subscription.channel} (${subscriptionId})`
      );
    }
  }

  /**
   * Handle incoming message routing to subscriptions
   */
  handleMessage(message: WebSocketMessage): void {
    if (message.channel) {
      this.subscriptions.forEach((subscription) => {
        if (subscription.channel === message.channel) {
          try {
            subscription.callback(message.data);
          } catch (error) {
            console.error(
              "❌ Error in WebSocket subscription callback:",
              error
            );
          }
        }
      });
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
  }
}


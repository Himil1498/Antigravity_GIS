const WebSocket = require("ws");
const ClientManager = require("./ClientManager");
const { verifyConnection } = require("./AuthHandler");
const {
  EVENTS,
  MESSAGE_TYPES,
  ERRORS,
  ERROR_MESSAGES,
} = require("./constants");

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clientManager = new ClientManager();
  }

  /**
   * Initialize WebSocket server
   * @param {http.Server} server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: "/ws",
    });

    this.wss.on(EVENTS.CONNECTION, (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log("✅ WebSocket Server initialized on path /ws");
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    // Authenticate
    const auth = verifyConnection(req);

    if (auth.error) {
      console.warn(`⚠️ WebSocket connection rejected - ${auth.error}`);
      ws.close(auth.code, auth.error);
      return;
    }

    const { userId, username } = auth;

    console.log(
      `✅ WebSocket client connected - User ID: ${userId} (${
        username || "N/A"
      })`
    );

    // Store client connection
    this.clientManager.addClient(userId, ws);

    // Setup message handlers
    ws.on(EVENTS.MESSAGE, (data) => {
      this.handleMessage(ws, userId, data);
    });

    ws.on(EVENTS.CLOSE, () => {
      this.handleClose(userId, ws);
    });

    ws.on(EVENTS.ERROR, (error) => {
      console.error(`❌ WebSocket error for user ${userId}:`, error);
    });

    // Send welcome message
    this.sendToClient(ws, {
      type: MESSAGE_TYPES.SYSTEM,
      event: EVENTS.CONNECTED,
      data: { message: "Connected to WebSocket server" },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle incoming messages from clients
   */
  handleMessage(ws, userId, data) {
    try {
      const message = JSON.parse(data);

      // Handle ping/pong for keepalive
      if (message.type === MESSAGE_TYPES.PING) {
        this.sendToClient(ws, {
          type: MESSAGE_TYPES.PONG,
          event: EVENTS.HEARTBEAT,
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log(`📨 Message from user ${userId}:`, message.type);
    } catch (error) {
      console.error("❌ Failed to parse WebSocket message:", error);
    }
  }

  /**
   * Handle client disconnection
   */
  handleClose(userId, ws) {
    this.clientManager.removeClient(userId, ws);
    console.log(`🔌 WebSocket client disconnected - User ID: ${userId}`);
  }

  /**
   * Send message to a specific client
   */
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Send message to all connections of a specific user
   */
  sendToUser(userId, message) {
    const userClients = this.clientManager.getClients(userId);

    if (!userClients || userClients.size === 0) {
      // Intentionally omitting warning to avoid log spam for offline users
      return false;
    }

    let sentCount = 0;
    userClients.forEach((ws) => {
      if (this.sendToClient(ws, message)) {
        sentCount++;
      }
    });

    return sentCount > 0;
  }

  /**
   * Force logout a user (send force_logout event)
   */
  forceLogoutUser(userId, reason = ERROR_MESSAGES.FORCE_LOGOUT_ADMIN) {
    const message = {
      type: MESSAGE_TYPES.SYSTEM,
      event: EVENTS.FORCE_LOGOUT,
      data: {
        reason,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const sent = this.sendToUser(userId, message);

    if (sent) {
      console.log(`✅ Force logout event sent to user ${userId}`);
      // Close all connections for this user after a brief delay
      setTimeout(() => {
        const userClients = this.clientManager.getClients(userId);
        if (userClients) {
          userClients.forEach((ws) => {
            ws.close(ERRORS.FORCE_LOGOUT, ERROR_MESSAGES.FORCE_LOGOUT_ADMIN);
          });
          // clientManager.removeClient is called automatically via 'close' event handler,
          // but we can ensure cleanup if needed. 'close' event is reliable though.
        }
      }, 1000);
    }

    return sent;
  }

  /**
   * Send session expired event to a user
   */
  sendSessionExpired(userId) {
    const message = {
      type: MESSAGE_TYPES.SYSTEM,
      event: EVENTS.SESSION_EXPIRED,
      data: {
        reason: "Session expired",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendToUser(userId, message);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    let sentCount = 0;
    this.clientManager.forEach((userClients) => {
      userClients.forEach((ws) => {
        if (this.sendToClient(ws, message)) {
          sentCount++;
        }
      });
    });

    return sentCount;
  }

  /**
   * Get number of connected clients
   */
  getConnectedClientsCount() {
    return this.clientManager.getConnectionCount();
  }

  /**
   * Get number of unique users connected
   */
  getConnectedUsersCount() {
    return this.clientManager.getUserCount();
  }

  /**
   * Check if a user has active connections
   */
  isUserConnected(userId) {
    return this.clientManager.hasUser(userId);
  }

  /**
   * Broadcast GIS data update to all clients
   */
  broadcastGISUpdate(toolType, action, data) {
    console.log(
      `📡 WebSocket: Broadcasting GIS update [${toolType}:${action}]`,
      data
    );
    this.broadcast({
      type: MESSAGE_TYPES.SYSTEM,
      event: EVENTS.GIS_DATA_UPDATED,
      channel: EVENTS.GIS_DATA_UPDATED, // Required for frontend SubscriptionManager
      data: { toolType, action, ...data },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast boundary published event to all clients
   */
  broadcastBoundaryPublished(regionId, regionName, userId, versionNumber) {
    console.log(
      `📡 WebSocket: Broadcasting boundary published [Region: ${regionId}]`
    );
    this.broadcast({
      type: MESSAGE_TYPES.SYSTEM,
      event: EVENTS.BOUNDARY_PUBLISHED,
      channel: EVENTS.BOUNDARY_PUBLISHED,
      data: { regionId, regionName, userId, versionNumber },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = WebSocketServer;

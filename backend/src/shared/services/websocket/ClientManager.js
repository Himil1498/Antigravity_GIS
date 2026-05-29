/**
 * ClientManager
 * Handles the storage and retrieval of WebSocket connections mapped to user IDs.
 */

class ClientManager {
  constructor() {
    this.clients = new Map(); // Map userId -> Set of WebSocket connections
  }

  /**
   * Add a client connection for a user
   * @param {string|number} userId 
   * @param {WebSocket} ws 
   */
  addClient(userId, ws) {
    const key = String(userId);
    if (!this.clients.has(key)) {
      this.clients.set(key, new Set());
    }
    this.clients.get(key).add(ws);
  }

  /**
   * Remove a client connection
   * @param {string|number} userId 
   * @param {WebSocket} ws 
   */
  removeClient(userId, ws) {
    const key = String(userId);
    const userClients = this.clients.get(key);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(key);
      }
    }
  }

  /**
   * Get all connections for a user
   * @param {string|number} userId 
   * @returns {Set<WebSocket>|null}
   */
  getClients(userId) {
    return this.clients.get(String(userId));
  }

  /**
   * Iterate over all users and their clients
   * @param {Function} callback (userClients, userId) => void
   */
  forEach(callback) {
    this.clients.forEach(callback);
  }

  /**
   * Get total number of active connections
   * @returns {number}
   */
  getConnectionCount() {
    let count = 0;
    this.clients.forEach((userClients) => {
      count += userClients.size;
    });
    return count;
  }

  /**
   * Get total number of unique connected users
   * @returns {number}
   */
  getUserCount() {
    return this.clients.size;
  }

  /**
   * Check if user is connected
   * @param {string|number} userId 
   * @returns {boolean}
   */
  hasUser(userId) {
    const userClients = this.clients.get(String(userId));
    return userClients && userClients.size > 0;
  }
}

module.exports = ClientManager;

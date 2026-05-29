/**
 * WebSocket Service Entry Point
 * Exports a singleton instance of the WebSocketServer.
 */

const WebSocketServer = require('./WebSocketServer');
// Create singleton instance
const websocketServer = new WebSocketServer();

module.exports = websocketServer;

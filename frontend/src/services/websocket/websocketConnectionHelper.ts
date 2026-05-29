
import { WS_URL } from "./constants";

/**
 * Establish WebSocket connection
 * Returns a Promise that resolves with the WebSocket instance when connected
 */
export const establishWebSocketConnection = (
  wsUrl: string = WS_URL
): Promise<WebSocket> => {
  return new Promise<WebSocket>((resolve, reject) => {
    // Get current access token (check both common locations for robustness)
    const accessToken = 
      sessionStorage.getItem("opti_connect_token") || 
      sessionStorage.getItem("opti_access_token") ||
      localStorage.getItem("opti_connect_token");

    console.log("🔑 [WebSocket] Token retrieval:", accessToken ? "SUCCESS (found)" : "FAILED (null)");
    if (accessToken) {
      console.log("🔑 [WebSocket] Token key used:", 
        sessionStorage.getItem("opti_connect_token") ? "opti_connect_token" : 
        sessionStorage.getItem("opti_access_token") ? "opti_access_token" : "localStorage"
      );
    }

    if (!accessToken) {
      console.warn("⚠️ [WebSocket] No access token available for connection. State:", {
        session_connect: !!sessionStorage.getItem("opti_connect_token"),
        session_access: !!sessionStorage.getItem("opti_access_token"),
        local_connect: !!localStorage.getItem("opti_connect_token")
      });
      reject(new Error("No access token available"));
      return;
    }

    // Create WebSocket connection with authentication
    const connectionUrl = `${wsUrl}/ws?token=${encodeURIComponent(accessToken)}`;
    console.log(
      "🌐 Attempting WebSocket connection to:",
      connectionUrl.replace(/token=[^&]*/, "token=***")
    );

    const ws = new WebSocket(connectionUrl);

    const connectionTimeout = setTimeout(() => {
      console.error("❌ WebSocket connection timeout after 10 seconds");
      // Clean up if timeout happens
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
      }
      reject(new Error("WebSocket connection timeout"));
    }, 10000); // 10 second timeout

    ws.onopen = () => {
      console.log("✅ WebSocket onopen fired - connection established!");
      clearTimeout(connectionTimeout);
      resolve(ws);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket onerror fired during connection:", error);
      // Don't reject here immediately, wait for timeout or onclose?
      // actually, critical connection errors usually fire close too.
      // But standard practice:
      clearTimeout(connectionTimeout);
      reject(error);
    };

    ws.onclose = (event) => {
      // Only meaningful if it happens before resolve.
      // Once resolved, this handler is overwritten by service or replaced.
      // BUT, checking readyState in timeout deals with hanging.
      // If it closes immediately:
      if (event.code !== 1000) { // 1000 is normal close
         console.error(`WebSocket closed during connection: ${event.code} ${event.reason}`);
      }
      // If promise not settled, we should reject?
      // It's tricky with promises.
      // Simplest: let timeout handle it if open never fires.
      // OR specifically reject if closed before open.
    };
  });
};


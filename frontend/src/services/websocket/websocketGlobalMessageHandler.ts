
import { WebSocketMessage } from "./types";

/**
 * Handle global system messages
 */
export const handleGlobalMessages = (message: WebSocketMessage): void => {
  switch (message.event) {
    case "system_notification":
      console.log("🔔 System notification:", message.data);
      break;

    case "system_update":
      console.log("🚀 System update published:", message.data);
      window.dispatchEvent(
        new CustomEvent("system:update_published", { detail: message.data })
      );
      break;

    case "heartbeat":
      // Ignore heartbeats to reduce console noise
      break;

    case "user_session_expired":
      console.warn("⚠️ User session expired via WebSocket");
      console.log("📤 Dispatching auth:session_expired event");
      // Notify advanced auth service about session expiry
      window.dispatchEvent(
        new CustomEvent("auth:session_expired", { detail: message.data })
      );
      console.log("✅ auth:session_expired event dispatched");
      break;

    case "force_logout":
      console.warn("⚠️⚠️⚠️ FORCE LOGOUT RECEIVED VIA WEBSOCKET ⚠️⚠️⚠️");
      console.log("Message data:", message.data);
      console.log("📤 Dispatching auth:force_logout custom event...");
      window.dispatchEvent(
        new CustomEvent("auth:force_logout", { detail: message.data })
      );
      console.log("✅ auth:force_logout event dispatched to window");
      break;

    case "boundary_published":
      console.log("🗺️ Region boundary published:", message.data);
      console.log("📤 Dispatching map:boundary_updated custom event...");
      window.dispatchEvent(
        new CustomEvent("map:boundary_updated", { detail: message.data })
      );
      console.log("✅ map:boundary_updated event dispatched to window");
      break;
      
    case "gis_data_updated":
      console.log("🌍 GIS Data Updated:", message.data);
      console.log("📤 Dispatching gis:data_updated custom event...");
      window.dispatchEvent(
        new CustomEvent("gis:data_updated", { detail: message.data })
      );
      console.log("✅ gis:data_updated event dispatched to window");
      break;

    default:
      if (message.event !== 'heartbeat') {
          console.log("📨 Unhandled WebSocket message:", message);
      }
  }
};


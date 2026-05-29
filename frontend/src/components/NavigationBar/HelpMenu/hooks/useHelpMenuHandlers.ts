// hooks/useHelpMenuHandlers.ts
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useHelpMenuHandlers = (
  onClose: () => void,
  onOpenContactSupport?: () => void,
) => {
  const navigate = useNavigate();

  const handleItemClick = useCallback(
    (action: string) => {
      onClose();

      switch (action) {
        case "view-user-guide":
          // Points to the User Guide page (formerly flow-diagram)
          navigate("/user-guide");
          break;
        case "view-flow-diagrams":
          // Points to Coming Soon page
          navigate("/coming-soon?feature=Flow Diagrams");
          break;
        case "view-keyboard-shortcuts":
          navigate("/keyboard-shortcuts");
          break;
        case "view-video-tutorials":
          navigate("/coming-soon?feature=Video Tutorials");
          break;
        case "contact-support":
          if (onOpenContactSupport) {
            onOpenContactSupport();
          } else {
            // Fallback to mailto if no modal handler provided
            window.location.href = "mailto:himil.chauhan@optimaltele.net";
          }
          break;
        case "view-database-schema":
          navigate("/system/schema");
          break;
        case "view-api-docs":
          navigate("/system/api-docs");
          break;
        case "view-server-architecture":
          navigate("/server-architecture");
          break;
        case "view-user-workflows":
          navigate("/user-workflows");
          break;
        default:
          break;
      }
    },
    [navigate, onClose, onOpenContactSupport],
  );

  return { handleItemClick };
};

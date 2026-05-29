import { useState } from 'react';

export const useContactSupport = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleContactSupport = () => {
    setShowContactModal(true);
    setEmailCopied(false);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setEmailCopied(false);
  };

  const handleOpenOutlookWeb = () => {
    const email = "himil.chauhan@optimaltele.net";
    const subject = "Support Request - Account Access Help";
    const body =
      "Hello Support Team,\n\nI need assistance with my account access.\n\nIssue Description:\n[Please describe your issue here]\n\nThank you for your help.";

    const outlookWebLink = `https://outlook.office365.com/mail/deeplink/compose?to=${email}&subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.open(outlookWebLink, "_blank");
  };

  const handleCopyEmail = async () => {
    const email = "himil.chauhan@optimaltele.net";
    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy email:", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = email;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 3000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return {
    showContactModal,
    emailCopied,
    handleContactSupport,
    handleCloseContactModal,
    handleOpenOutlookWeb,
    handleCopyEmail
  };
};


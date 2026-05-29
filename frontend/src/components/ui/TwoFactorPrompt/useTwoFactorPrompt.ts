import { useState, useEffect, useRef } from 'react';

export const useTwoFactorPrompt = (
  isOpen: boolean,
  expiresIn: number,
  onVerify: (code: string) => Promise<void>,
  onResendCode: () => Promise<void>
) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, expiresIn]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) inputRefs.current[0]?.focus();
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5 && value && newCode.every((d) => d !== '')) handleVerify(newCode.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    else if (e.key === 'Enter' && code.every((d) => d !== '')) handleVerify(code.join(''));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeValue: string) => {
    if (codeValue.length !== 6) { setError('Please enter all 6 digits'); return; }
    setIsVerifying(true);
    setError('');
    try {
      await onVerify(codeValue);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setIsVerifying(false); }
  };

  const handleResend = async () => {
    if (!canResend && timeLeft > 0) return;
    try {
      setError('');
      await onResendCode();
      setTimeLeft(expiresIn);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to resend code'); }
  };

  return {
    code, isVerifying, error, timeLeft, canResend, inputRefs,
    formatTime, handleInputChange, handleKeyDown, handlePaste, handleVerify, handleResend,
  };
};


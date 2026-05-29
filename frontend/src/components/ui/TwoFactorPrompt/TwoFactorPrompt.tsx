import React from 'react';
import { TwoFactorPromptProps } from './types';
import { useTwoFactorPrompt } from './useTwoFactorPrompt';

const TwoFactorPrompt: React.FC<TwoFactorPromptProps> = ({ isOpen, onClose, onVerify, onResendCode, email, expiresIn = 600 }) => {
  const { code, isVerifying, error, timeLeft, canResend, inputRefs, formatTime, handleInputChange, handleKeyDown, handlePaste, handleVerify, handleResend } = useTwoFactorPrompt(isOpen, expiresIn, onVerify, onResendCode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600 text-sm">We've sent a verification code to<br /><span className="font-semibold text-gray-900">{email}</span></p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-digit code</label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} disabled={isVerifying}
                aria-label={`Verification code digit ${index + 1}`}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${error ? 'border-red-500 bg-red-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Timer & Resend */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className={timeLeft <= 60 ? 'text-red-600 font-semibold' : ''}>{formatTime(timeLeft)}</span>
          </div>
          <button onClick={handleResend} disabled={!canResend && timeLeft > 0} className={`font-medium transition-colors ${canResend || timeLeft === 0 ? 'text-blue-600 hover:text-blue-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>Resend Code</button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isVerifying} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={() => handleVerify(code.join(''))} disabled={isVerifying || code.some((d) => !d)} className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isVerifying ? (<><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Verifying...</>) : 'Verify'}
          </button>
        </div>

        {/* Note */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">🔒 This code expires in {Math.ceil(expiresIn / 60)} minutes. Never share it with anyone.</p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorPrompt;


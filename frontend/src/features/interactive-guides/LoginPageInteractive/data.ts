import { Step, SecurityFeature, ProTip } from './types';

// Steps data for Login flow
export const steps: Step[] = [
  {
    id: 1,
    title: "Access Login Page",
    icon: "🌐",
    color: "blue",
    action: "Navigate to login page",
    result: "Login page loads with welcome interface",
    details: [
      "Visit the login page",
      "If already logged in: Automatically redirected to map page",
      "If not logged in: Login form appears",
      "Page displays OptiConnect logo with animation",
      "Background shows animated gradient (blue-indigo-purple)",
      "System status badge shows 'All Systems Operational' (green pulse)",
      "Dark mode automatically detected and applied"
    ]
  },
  {
    id: 2,
    title: "View Login Form",
    icon: "📝",
    color: "indigo",
    action: "User sees comprehensive login interface",
    result: "Form ready for credential entry with security features",
    details: [
      "Form card displays with lock icon header",
      "Username/Email field (text input with user icon)",
      "Password field (masked input with eye icon for show/hide)",
      "Remember Me checkbox (saves username for convenience)",
      "Blue 'Sign In' button with loading animation",
      "Link: 'Forgot Password?' (opens password reset modal)",
      "Link: 'Need Help? Contact Support' (opens support modal)",
      "All fields have validation: Both required before submit"
    ]
  },
  {
    id: 3,
    title: "Enter Credentials",
    icon: "🔑",
    color: "purple",
    action: "User inputs username/email and password",
    result: "Fields validated in real-time with error feedback",
    details: [
      "Type username or email in first field",
      "Type password in second field (masked by default)",
      "Click eye icon to toggle password visibility",
      "Check 'Remember Me' to save username (optional)",
      "Error banner (red) appears if validation fails",
      "Error auto-clears when user starts typing again",
      "Submit button enables only when both fields filled",
      "Frontend validation: No empty fields allowed"
    ]
  },
  {
    id: 4,
    title: "Submit Login",
    icon: "⚡",
    color: "green",
    action: "Click 'Sign In' button to authenticate",
    result: "Login process begins with visual feedback",
    details: [
      "User clicks blue 'Sign In' button",
      "Button shows loading spinner",
      "Button becomes disabled to prevent duplicate submissions",
      "Authentication process begins",
      "User sees visual feedback during login",
      "Process typically takes 1-2 seconds"
    ]
  },
  {
    id: 5,
    title: "Login Success",
    icon: "✅",
    color: "emerald",
    action: "Credentials verified successfully",
    result: "User logged in and redirected to map page",
    details: [
      "Authentication successful",
      "Welcome message appears briefly",
      "Session created automatically",
      "Username saved if 'Remember Me' was checked",
      "Any error messages cleared",
      "Automatic redirect to map page (default landing page)",
      "User can now access all features based on their role",
      "Real-time updates enabled for notifications"
    ]
  },
  {
    id: 6,
    title: "Login Failure",
    icon: "❌",
    color: "pink",
    action: "Invalid credentials entered",
    result: "Error message displayed to user",
    details: [
      "Login attempt fails",
      "Red error banner appears above form",
      "Possible error messages:",
      "  • 'User not found' (invalid username/email)",
      "  • 'Invalid credentials' (wrong password)",
      "  • 'Account has been deactivated' (contact admin)",
      "  • 'Please verify your email first' (check inbox)",
      "Error message shows specific reason for failure",
      "Button returns to normal state",
      "User can retry with corrected credentials",
      "Error clears automatically when user starts typing"
    ]
  },
  {
    id: 7,
    title: "Forgot Password",
    icon: "🔐",
    color: "orange",
    action: "User clicks 'Forgot Password?' link",
    result: "Password reset request modal opens",
    details: [
      "Click 'Forgot Password?' link below form",
      "Modal opens with centered overlay",
      "Field 1: Username/Email (required)",
      "Field 2: Reason for request (optional)",
      "Buttons: 'Send Request' (purple) and 'Cancel' (gray)",
      "Click 'Send Request' to submit",
      "Success message appears",
      "Admin team receives notification to process your request",
      "Modal closes automatically"
    ]
  },
  {
    id: 8,
    title: "Receive Reset Instructions",
    icon: "📧",
    color: "cyan",
    action: "Admin processes reset request",
    result: "User receives reset instructions via email",
    details: [
      "Admin reviews your password reset request",
      "Admin sends reset instructions to your email",
      "Check your inbox for email from support",
      "Email contains either:",
      "  • Password reset link (click to reset)",
      "  • Temporary password (use to login)",
      "Follow instructions in email",
      "Use new credentials to login",
      "Change password immediately after first login"
    ]
  },
  {
    id: 9,
    title: "Contact Support",
    icon: "💬",
    color: "teal",
    action: "User clicks 'Need Help? Contact Support' link",
    result: "Support contact modal opens with options",
    details: [
      "Click 'Need Help?' link at bottom of form",
      "Modal displays support email: himil.chauhan@optimaltele.net",
      "Option 1: 'Open in Outlook' button",
      "  • Opens email client with pre-filled template",
      "  • Subject: 'Support Request - Account Access Help'",
      "  • Body includes greeting and issue description template",
      "Option 2: 'Copy Email' button",
      "  • Copies email address to clipboard",
      "  • Shows green checkmark with 'Email copied!' message",
      "  • Use in your preferred email app"
    ]
  }
];

// Security features data
export const securityFeatures: SecurityFeature[] = [
  {
    name: "Secure Login",
    icon: "🔒",
    color: "red",
    details: "Passwords are securely encrypted and never stored in plain text. Strong security measures protect your account."
  },
  {
    name: "Secure Sessions",
    icon: "🎫",
    color: "blue",
    details: "Your session is securely managed with automatic expiry after period of inactivity for your protection."
  },
  {
    name: "Email Verification",
    icon: "✉️",
    color: "green",
    details: "Email verification required before first login. Prevents unauthorized account creation and ensures account security."
  },
  {
    name: "Account Status",
    icon: "👤",
    color: "purple",
    details: "Admin can activate/deactivate accounts for security. Active accounts can login, deactivated accounts cannot."
  }
];

// Pro tips data
export const proTips: ProTip[] = [
  { title: "🔐 Use Strong Passwords", content: "Minimum 8 characters with mix of uppercase, lowercase, numbers, and symbols" },
  { title: "📧 Verify Email First", content: "Check inbox/spam for verification link before attempting first login" },
  { title: "💾 Remember Me Wisely", content: "Only use on personal devices. Uncheck on shared/public computers" },
  { title: "🚪 Always Logout", content: "Click logout button when done. Clears session and protects account" },
  { title: "⏱️ Session Expiry", content: "Session auto-expires after period of inactivity. Login again to continue" },
  { title: "📱 Mobile Compatible", content: "Fully responsive design. Works on all devices and screen sizes" },
  { title: "🌙 Dark Mode Support", content: "Automatically detects system preference. Easy on eyes at night" },
  { title: "🆘 Contact Support Anytime", content: "Having trouble? Use support link for immediate assistance" }
];


import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  UserPlus,
  MailCheck,
  LogIn,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Send,
  UserCog,
  Headset,
  CheckCircle2,
  Mail,
  Copy,
  ExternalLink
} from "lucide-react";

type FlowTab = "creation" | "login" | "password" | "support";

export type ThemeColor = "blue" | "emerald" | "indigo" | "purple" | "amber" | "orange" | "rose" | "pink";

interface StepData {
  id: number;
  title: string;
  description: string[];
  icon: any;
  theme: ThemeColor;
}

const CREATION_FLOW: StepData[] = [
  {
    id: 1,
    title: "User Creation by Admin",
    description: [
      "Admin creates a new user in the system.",
      "Admin assigns appropriate roles and permissions.",
      "The system automatically sends a verification email to the user's registered email address."
    ],
    icon: UserPlus,
    theme: "blue"
  },
  {
    id: 2,
    title: "Email Verification",
    description: [
      "User receives a verification email containing a secure link.",
      "When clicked, the user is redirected to the official application URL.",
      "The account gets verified, making the user eligible to log in."
    ],
    icon: MailCheck,
    theme: "emerald"
  }
];

const LOGIN_FLOW: StepData[] = [
  {
    id: 1,
    title: "Open Login Page",
    description: [
      "User opens the official application URL.",
      "The secure login screen is displayed."
    ],
    icon: LogIn,
    theme: "indigo"
  },
  {
    id: 2,
    title: "Enter Credentials",
    description: [
      "User logs in using either their UserID, Full Name, or Username.",
      "The user must provide their secure Password."
    ],
    icon: ShieldCheck,
    theme: "purple"
  },
  {
    id: 3,
    title: "Authentication Validation",
    description: [
      "The system validates the entered credentials.",
      "If correct, the user logs in successfully and is redirected to the dashboard.",
      "If incorrect, an error message is displayed and the user is allowed to retry."
    ],
    icon: CheckCircle2,
    theme: "emerald"
  }
];

const PASSWORD_FLOW: StepData[] = [
  {
    id: 1,
    title: "Click on Forgot Password",
    description: [
      "User clicks on the \"Forgot Password\" option from the login screen."
    ],
    icon: KeyRound,
    theme: "amber"
  },
  {
    id: 2,
    title: "Enter Required Details",
    description: [
      "User must enter their Registered Email Address.",
      "User must provide a Reason for the Password Change Request."
    ],
    icon: AlertCircle,
    theme: "orange"
  },
  {
    id: 3,
    title: "Submit Request",
    description: [
      "User submits the password reset request.",
      "The system automatically forwards the request to the Administrator."
    ],
    icon: Send,
    theme: "blue"
  },
  {
    id: 4,
    title: "Admin Action",
    description: [
      "Admin reviews the request in the system.",
      "Admin manually resets or changes the password.",
      "Updated credentials or instructions are directly communicated to the user."
    ],
    icon: UserCog,
    theme: "indigo"
  }
];

const SUPPORT_FLOW: StepData[] = [
  {
    id: 1,
    title: "Initiate Support Contact",
    description: [
      "User clicks the \"Contact Support\" option available on the login screen.",
      "This is primarily used to report technical issues, resolve login problems, or request general assistance."
    ],
    icon: Headset,
    theme: "rose"
  },
  {
    id: 2,
    title: "Choose Communication Method",
    description: [
      "Option A: Open the default email client (like Outlook or Windows Mail) to automatically draft a message.",
      "Option B: Copy the official support email address to the clipboard manually."
    ],
    icon: Mail,
    theme: "pink"
  }
];

const TABS = [
  { id: "creation", label: "Creation & Verification", icon: UserPlus },
  { id: "login", label: "Standard Login Flow", icon: LogIn },
  { id: "password", label: "Forgot Password", icon: KeyRound },
  { id: "support", label: "Contact Support", icon: Headset }
];

export const LoginWorkflowGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FlowTab>("login");

  const getThemeClasses = (theme: ThemeColor) => {
    switch (theme) {
      case "blue": return { iconBg: "bg-blue-500", cardBg: "bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-800", border: "border-blue-100 dark:border-blue-900/50 group-hover:border-blue-300 dark:group-hover:border-blue-700", badgeBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300", bullet: "bg-blue-400" };
      case "emerald": return { iconBg: "bg-emerald-500", cardBg: "bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-800", border: "border-emerald-100 dark:border-emerald-900/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-700", badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300", bullet: "bg-emerald-400" };
      case "indigo": return { iconBg: "bg-indigo-500", cardBg: "bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-800", border: "border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700", badgeBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300", bullet: "bg-indigo-400" };
      case "purple": return { iconBg: "bg-purple-500", cardBg: "bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-800", border: "border-purple-100 dark:border-purple-900/50 group-hover:border-purple-300 dark:group-hover:border-purple-700", badgeBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300", bullet: "bg-purple-400" };
      case "amber": return { iconBg: "bg-amber-500", cardBg: "bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-900/10 dark:to-slate-800", border: "border-amber-100 dark:border-amber-900/50 group-hover:border-amber-300 dark:group-hover:border-amber-700", badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300", bullet: "bg-amber-400" };
      case "orange": return { iconBg: "bg-orange-500", cardBg: "bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-900/10 dark:to-slate-800", border: "border-orange-100 dark:border-orange-900/50 group-hover:border-orange-300 dark:group-hover:border-orange-700", badgeBg: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300", bullet: "bg-orange-400" };
      case "rose": return { iconBg: "bg-rose-500", cardBg: "bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-900/10 dark:to-slate-800", border: "border-rose-100 dark:border-rose-900/50 group-hover:border-rose-300 dark:group-hover:border-rose-700", badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300", bullet: "bg-rose-400" };
      case "pink": return { iconBg: "bg-pink-500", cardBg: "bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-900/10 dark:to-slate-800", border: "border-pink-100 dark:border-pink-900/50 group-hover:border-pink-300 dark:group-hover:border-pink-700", badgeBg: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300", bullet: "bg-pink-400" };
      default: return { iconBg: "bg-slate-500", cardBg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", badgeBg: "bg-slate-100 text-slate-700", bullet: "bg-slate-400" };
    }
  };

  const getActiveFlow = () => {
    switch(activeTab) {
      case "creation": return CREATION_FLOW;
      case "login": return LOGIN_FLOW;
      case "password": return PASSWORD_FLOW;
      case "support": return SUPPORT_FLOW;
      default: return LOGIN_FLOW;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-6 lg:p-12 font-sans select-none">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/user-workflows')}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              GIS Platform Login Workflow
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Complete documentation for End-to-End User Authentication mapping.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden shadow-indigo-500/5">
          
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FlowTab)}
                  className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : ""}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" 
                      initial={false}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Flow Content */}
          <div className="p-8 lg:p-12 relative min-h-[500px] bg-slate-50 dark:bg-[#0f172a]/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-8 relative"
              >
                {/* Vertical Line Connector */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

                {getActiveFlow().map((step, index) => {
                  const StepIcon = step.icon;
                  const theme = getThemeClasses(step.theme);

                  return (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                      className="relative z-10 flex items-start gap-6 group"
                    >
                      {/* Icon Node */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-black/10 ring-4 ring-white dark:ring-slate-800 z-10 ${theme.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      
                      {/* Content Card */}
                      <div className={`flex-1 border rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-all duration-300 ${theme.cardBg} ${theme.border}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider shadow-sm ${theme.badgeBg}`}>
                            Step {step.id}
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {step.title}
                          </h3>
                        </div>
                        <ul className="space-y-3">
                          {step.description.map((desc, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 shadow-sm ${theme.bullet}`} />
                              <span className="leading-relaxed text-[15px] font-medium text-slate-600 dark:text-slate-300 shadow-white/10 text-shadow-sm">{desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Global Overview Meta */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1">Architecture Overview</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
              The Authentication layer is strictly enforced by the backend via JWT token resolution. Actions requiring higher privilege such as Password Resets correctly defer to manual Administrator routing to preserve network security protocols.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginWorkflowGuidePage;

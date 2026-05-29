import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  Key,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Theme Configuration for Users Module (Fuchsia Theme based on Workflows Map)
const theme = {
  primary: 'text-fuchsia-600 dark:text-fuchsia-400',
  primaryBg: 'bg-fuchsia-600 dark:bg-fuchsia-500',
  secondaryBg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30',
  border: 'border-fuchsia-200 dark:border-fuchsia-800',
  hover: 'hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/40',
  gradient: 'from-fuchsia-600 to-purple-600',
  iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
};

// Data Structure for Guide Steps
type GuideStep = {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  details: string[];
};

type GuideSection = {
  id: string;
  title: string;
  icon: React.FC<any>;
  steps: GuideStep[];
};

const guideSections: GuideSection[] = [
  {
    id: 'creation',
    title: 'User Creation & Management',
    icon: UserPlus,
    steps: [
      {
        id: 'dashboard',
        title: 'Users Dashboard & Roles',
        description: 'View the summary of all users across different roles.',
        icon: Users,
        details: [
          'Role-based summary cards show counts for Admin, Manager, Technician, Developer, and standard User.',
          'Access is restricted to authorized personnel (Admins or designated user managers).',
          'Use the search bar to find users by Name, Email, or Username.',
          'Filter the table by Status (Active/Inactive) or specific Roles.'
        ]
      },
      {
        id: 'create',
        title: 'Create a New User',
        description: 'Add a new user to the platform ecosystem.',
        icon: UserPlus,
        details: [
          'Click the "Add New User" button located above the main table.',
          'Fill out required profile information including Name, Email, Mobile, and Location.',
          'Assign a primary Role (which dictates their default base permissions).',
          'Once submitted, the user appears in the table as Inactive until permissions are finalized.'
        ]
      },
      {
        id: 'table',
        title: 'Table Operations',
        description: 'Manage users directly from the administration table.',
        icon: Filter,
        details: [
          'Review the Verification array (Email Status, 2FA setup, Assigned Regions).',
          'Use the View User action to see comprehensive profile details.',
          'Use the Edit User action to modify non-security details.',
          'Use the Delete User action to permanently purge a record from the database.'
        ]
      }
    ]
  },
  {
    id: 'permissions',
    title: 'Permissions & Activation',
    icon: ShieldCheck,
    steps: [
      {
        id: 'assign_perms',
        title: 'Manage Permissions Dialog',
        description: 'Configure granulary security clearances for the user.',
        icon: ShieldCheck,
        details: [
          'Click "Manage Permissions" on the target user row in the table.',
          'Default Role permissions are hardcoded and cannot be removed here (managed in Role Creation).',
          'Assign extra custom permissions specific to this user\'s temporary or special needs.',
          'Review the specific regional or module access they have been granted.'
        ]
      },
      {
        id: 'activation',
        title: 'Activate the Account',
        description: 'Change the user status from Inactive to Active.',
        icon: CheckCircle2,
        details: [
          'Inside the Permission Dialog, after finalizing settings, click the "Activate User" button.',
          'This action turns the user Status to Active in the system.',
          'This automatically triggers the Verification Email procedure.'
        ]
      },
      {
        id: 'verification',
        title: 'Email Verification Loop',
        description: 'The final step before the user can authenticate.',
        icon: Mail,
        details: [
          'The system dispatches an email containing the Login URL, Username, auto-generated Password, and a Verification Link.',
          'The user clicks the verification link in their email inbox.',
          'The system flags them as Verified, granting them permission to execute the Login Flow.',
          'If the email drops, Admins can click "Resend Mail" or perform a "Manual Verification" override.'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Security Enforcement',
    icon: Lock,
    steps: [
      {
        id: 'two_factor',
        title: 'Force Enable 2FA',
        description: 'Enforce strict security protocols on high-risk accounts.',
        icon: Lock,
        details: [
          'Admins can click "Force Enable 2FA" from the user table actions.',
          'This sets a flag on the user\'s account.',
          'During their next login attempt, they will be blocked from accessing the platform until they scan and verify a new Authenticator OTP.'
        ]
      },
      {
        id: 'password_reset',
        title: 'Administrative Password Reset',
        description: 'Trigger a recovery flow for locked users.',
        icon: Key,
        details: [
          'Click "Forgot Password" on the user\'s row to force a password cycle.',
          'This immediately logs the user out and clears their active sessions.',
          'They will receive an email instructing them to establish new secure credentials.'
        ]
      },
      {
        id: 'audit',
        title: 'Verification Status Tracking',
        description: 'Monitor the exact state of account setups.',
        icon: AlertCircle,
        details: [
          'If a user is NOT verified, the "Resend Mail" and "Manual Verify" buttons are visible.',
          'Once a user completes verification, these buttons automatically hide themselves to prevent redundant actions.',
          'The Email Verification Status column updates in real-time.'
        ]
      }
    ]
  }
];

export const UsersGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(guideSections[0].id);
  const [activeStep, setActiveStep] = useState(0);

  const activeSection = guideSections.find(s => s.id === activeTab) || guideSections[0];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-6 lg:p-12 lg:pb-32 font-sans transition-colors duration-200">
      
      {/* Navigation & Header Space */}
      <div className="max-w-5xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex gap-6 items-start">
            <button 
              onClick={() => navigate('/user-workflows')}
              className="mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm group flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
            </button>
            <div>
              <div className={`inline-flex items-center justify-center p-3 rounded-2xl ${theme.secondaryBg} border ${theme.border} mb-6 mt-1`}>
                <Users className={`w-8 h-8 ${theme.primary}`} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                Users Module
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Step-by-step documentation for managing users, assigning roles, and deploying security protocols.
              </p>
            </div>
          </div>
          <div className="flex -space-x-3 mb-2">
            {[UserPlus, ShieldCheck, Lock].map((Icon, i) => (
              <div key={i} className={`w-12 h-12 rounded-full border-4 border-slate-50 dark:border-[#0f172a] ${theme.secondaryBg} flex items-center justify-center shadow-sm`}>
                <Icon className={`w-5 h-5 ${theme.primary}`} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Interactive Interface */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/50 overflow-hidden backdrop-blur-xl">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-700/50">
            {guideSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeTab === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabChange(section.id)}
                  className={`
                    flex items-center min-w-max px-8 py-5 text-sm font-bold transition-all relative
                    ${isActive 
                      ? `${theme.primary} bg-slate-50/50 dark:bg-slate-800/80` 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {section.title}
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className={`absolute bottom-0 left-0 right-0 height-1 h-0.5 bg-gradient-to-r ${theme.gradient}`} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              
              {/* Left Column: Vertical Stepper */}
              <div className="md:col-span-4 space-y-2 relative">
                {/* Visual connecting line behind steps */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
                
                {activeSection.steps.map((step, index) => {
                  const isActive = activeStep === index;
                  const StepIcon = step.icon;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(index)}
                      className={`
                        w-full text-left p-4 rounded-2xl flex items-start relative z-10 transition-all duration-200
                        ${isActive 
                          ? `${theme.secondaryBg} shadow-sm border ${theme.border}` 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}
                      `}
                    >
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors
                        ${isActive 
                          ? `${theme.primaryBg} text-white shadow-md shadow-fuchsia-500/20` 
                          : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm'}
                      `}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <div className={`text-xs font-bold tracking-wider uppercase mb-1 ${isActive ? theme.primary : 'text-slate-400'}`}>
                          Step {index + 1}
                        </div>
                        <div className={`font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                          {step.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Step Details */}
              <div className="md:col-span-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${activeStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-slate-50 dark:bg-[#0f172a]/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/30 h-full"
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center mr-5 shadow-inner`}>
                        {React.createElement(activeSection.steps[activeStep].icon, { className: `w-7 h-7 ${theme.primary}` })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                          {activeSection.steps[activeStep].title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          {activeSection.steps[activeStep].description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeSection.steps[activeStep].details.map((detail, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 + 0.2 }}
                          className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50"
                        >
                          <div className={`mr-4 mt-1 w-6 h-6 rounded-full ${theme.secondaryBg} flex items-center justify-center flex-shrink-0`}>
                            <div className={`w-2 h-2 rounded-full ${theme.primaryBg}`} />
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {detail}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

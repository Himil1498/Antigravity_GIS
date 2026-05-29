import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserFormModalProps } from "./types";
import ModalHeader from "./components/ModalHeader";
import PersonalInfoSection from "./components/PersonalInfoSection";
import AddressInfoSection from "./components/AddressInfoSection";
import WorkInfoSection from "./components/WorkInfoSection";
import FormActions from "./components/FormActions";

const modalAccents = {
  create: {
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    glow: "rgba(139, 92, 246, 0.4)",
    border: "border-white/20 dark:border-white/10",
  },
  edit: {
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    glow: "rgba(59, 130, 246, 0.4)",
    border: "border-white/20 dark:border-white/10",
  },
  view: {
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    glow: "rgba(16, 185, 129, 0.4)",
    border: "border-white/20 dark:border-white/10",
  },
};

const UserFormModalMain: React.FC<UserFormModalProps> = ({
  isOpen,
  modalType,
  formData,
  formErrors,
  isLoading,
  onClose,
  onSave,
  onChange,
  onFieldChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isViewMode = modalType === "view";
  const accent = modalAccents[modalType] || modalAccents.create;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isViewMode) {
      onSave();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Lighter Blur Backdrop for better performance */}
          <motion.div
            className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Compact Full Screen Modal Container */}
          <motion.div
            className={`relative w-full h-full flex flex-col bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md rounded-3xl shadow-2xl ${accent.border} border overflow-hidden`}
            style={{
              boxShadow: `
                0 25px 60px rgba(0,0,0,0.4),
                0 0 60px ${accent.glow},
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b ${accent.gradient} pointer-events-none opacity-60`} />

            {/* Header - Transparent and floating */}
            <div className="flex-none px-6 pt-6 pb-2 relative z-10">
              <ModalHeader modalType={modalType} onClose={onClose} />
            </div>

            {/* Highly Optimized Grid Form Body - Added will-change-transform for smooth scrolling */}
            <div className="flex-1 overflow-y-auto px-6 py-1 scroll-smooth relative z-10" style={{ scrollbarWidth: "none", willChange: "transform" }}>
              {/* Hide scrollbar with custom CSS for webkit as well */}
              <style>{`
                ::-webkit-scrollbar { display: none; }
              `}</style>
              
              <form id="user-form" onSubmit={handleSubmit} className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-6">
                  
                  {/* Left Column: Personal Information (Takes up more space naturally) */}
                  <div className="lg:col-span-5 h-full">
                    <PersonalInfoSection
                      formData={formData}
                      formErrors={formErrors}
                      isViewMode={isViewMode}
                      onChange={onChange}
                      onFieldChange={onFieldChange}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      modalType={modalType}
                    />
                  </div>

                  {/* Right Column Grid: Work & Address Stacked cleanly */}
                  <div className="lg:col-span-7 flex flex-col gap-5 h-full">
                    <WorkInfoSection
                      department={formData.department || ""}
                      officeLocation={formData.officeLocation || ""}
                      role={formData.role || "user"}
                      status={formData.status || "Active"}
                      formErrors={formErrors}
                      isViewMode={isViewMode}
                      onChange={onChange}
                      onFieldChange={onFieldChange}
                    />

                    <AddressInfoSection
                      address={formData.address || {}}
                      formErrors={formErrors}
                      isViewMode={isViewMode}
                      onChange={onChange}
                      onFieldChange={onFieldChange}
                    />
                  </div>

                </div>
              </form>
            </div>

            {/* Footer Actions - Removed backdrop-blur to eliminate scroll painting lag */}
            <div className="flex-none px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] relative z-20">
              <FormActions
                isViewMode={isViewMode}
                isLoading={isLoading}
                modalType={modalType}
                onClose={onClose}
                onSubmit={handleSubmit}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserFormModalMain;

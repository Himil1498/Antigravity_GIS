import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Save,
  Pencil,
  Building2,
  MapPin,
  Phone,
  CloudLightning,
  User,
  Server,
  Hash,
} from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { networkPlanningService } from "../../services/api";
import LocationPickerModal from "../NetworkMap/LocationPickerModal";
import { showToast } from "../../../../utils/toastUtils";

interface ApprovalEditModalProps {
  approval: Record<string, unknown> | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Editable field config */
interface EditableField {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
  isTopLevel?: boolean; // true = lives on form_data directly (name, latitude, longitude)
}

interface FieldSection {
  title: string;
  icon: React.ElementType;
  colorClass: string;
  fields: EditableField[];
}

const BOOLEAN_OPTIONS = [
  { value: "", label: "— Not Set —" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

/**
 * Glassmorphic modal for BM to edit a pending submission's form data.
 * Renders grouped, colored editable fields based on the infra type.
 */
const ApprovalEditModal: React.FC<ApprovalEditModalProps> = ({
  approval,
  onClose,
  onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isMapOpen, setIsMapOpen] = useState(false);

  const fd = (approval as Record<string, unknown>)?.form_data as Record<string, unknown> | undefined;
  const props = (fd?.properties || {}) as Record<string, unknown>;
  const folderPath = String(
    (approval as Record<string, unknown>)?.folder_path ||
    (approval as Record<string, unknown>)?.folder_name || ""
  ).toLowerCase();

  const isCustomer = folderPath.includes("customer");
  const isPop =
    !isCustomer &&
    (folderPath.includes("> pop >") ||
      folderPath.includes("> pop") ||
      props.type === "POP" ||
      String(fd?.iconType || "").toLowerCase() === "pop");

  /** Build editable fields grouped by sections */
  const sections: FieldSection[] = useMemo(() => {
    const commonFields: EditableField[] = [
      { key: "name", label: "Name", isTopLevel: true },
      { key: "latitude", label: "Latitude", type: "number", isTopLevel: true },
      { key: "longitude", label: "Longitude", type: "number", isTopLevel: true },
    ];

    if (isPop) {
      return [
        {
          title: "Basic Information",
          icon: Building2,
          colorClass: "text-indigo-500",
          fields: [...commonFields, { key: "height", label: "Height (m)", type: "number" }],
        },
        {
          title: "POP Details",
          icon: Server,
          colorClass: "text-purple-500",
          fields: [
            { key: "popId", label: "POP ID" },
            { key: "popType", label: "POP Type" },
            { key: "siteId", label: "Site ID" },
            { key: "infraProvider", label: "Infra Provider" },
            { key: "referenceNumber", label: "RL Number" },
            { key: "btsType", label: "BTS Type" },
            { key: "gbtTowerHeight", label: "GBT Tower Height (m)", type: "number" },
            { key: "rttTowerHeight", label: "RTT Tower Height (m)", type: "number" },
            { key: "rttBuildingHeight", label: "RTT Building Height (m)", type: "number" },
          ],
        },
        {
          title: "Location",
          icon: MapPin,
          colorClass: "text-blue-500",
          fields: [
            { key: "region", label: "Region" },
            { key: "country", label: "Country" },
            { key: "state", label: "State" },
            { key: "district", label: "District" },
            { key: "city", label: "City/Village" },
            { key: "area", label: "Area" },
          ],
        },
        {
          title: "Site Information",
          icon: CloudLightning,
          colorClass: "text-amber-500",
          fields: [
            { key: "rackType", label: "Rack Type" },
            { key: "powerSource", label: "Power Source" },
            { key: "powerPhase", label: "Phase" },
            { key: "powerProvider", label: "Power Provider" },
            { key: "acAvailability", label: "AC Availability", type: "select", options: BOOLEAN_OPTIONS },
          ],
        },
        {
          title: "Contact Information & Notes",
          icon: Phone,
          colorClass: "text-rose-500",
          fields: [
            { key: "rackSpace", label: "Rack Space" },
            { key: "ubrMountingPermission", label: "UBR Mounting Permission" },
            { key: "technicianName", label: "Technician Name" },
            { key: "technicianNumber", label: "Technician Number" },
            { key: "supervisorName", label: "Supervisor Name" },
            { key: "supervisorNumber", label: "Supervisor Number" },
            { key: "notes", label: "Notes", type: "textarea" },
          ],
        },
      ];
    }

    if (isCustomer) {
      return [
        {
          title: "Basic Information",
          icon: Building2,
          colorClass: "text-indigo-500",
          fields: commonFields,
        },
        {
          title: "Circuit Details",
          icon: Hash,
          colorClass: "text-green-500",
          fields: [
            { key: "circuitName", label: "Circuit Name" },
            { key: "productType", label: "Product Type" },
            { key: "connectedPop", label: "Connected Infra" },
            { key: "bandwidth", label: "Bandwidth" },
            { key: "mediaType", label: "Media Type" },
          ],
        },
        {
          title: "Customer Address & Notes",
          icon: MapPin,
          colorClass: "text-blue-500",
          fields: [
            { key: "customerAddress", label: "Physical Address" },
            { key: "region", label: "Region" },
            { key: "state", label: "State" },
            { key: "district", label: "District" },
            { key: "city", label: "City/Village" },
            { key: "pincode", label: "Pincode" },
            { key: "notes", label: "Notes", type: "textarea" },
          ],
        },
      ];
    }

    // Generic Infrastructure
    return [
      {
        title: "Basic Information",
        icon: Building2,
        colorClass: "text-indigo-500",
        fields: [...commonFields, { key: "height", label: "Height (m)", type: "number" }],
      },
      {
        title: "Address",
        icon: MapPin,
        colorClass: "text-blue-500",
        fields: [
          { key: "street", label: "Street Address" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "pincode", label: "Pincode" },
        ],
      },
      {
        title: "Contact Information",
        icon: Phone,
        colorClass: "text-rose-500",
        fields: [
          { key: "contactName", label: "Contact Person" },
          { key: "phone", label: "Phone Number" },
          { key: "email", label: "Email" },
        ],
      },
      {
        title: "Rental Information",
        icon: Building2,
        colorClass: "text-teal-500",
        fields: [
          { key: "isRented", label: "Rented", type: "select", options: BOOLEAN_OPTIONS },
          { key: "monthlyRent", label: "Monthly Rent", type: "number" },
          { key: "agreementStart", label: "Agreement Start" },
          { key: "agreementEnd", label: "Agreement End" },
          { key: "landlordName", label: "Landlord Name" },
          { key: "landlordContact", label: "Landlord Contact" },
        ],
      },
      {
        title: "Owner & Business",
        icon: User,
        colorClass: "text-cyan-500",
        fields: [
          { key: "ownerName", label: "Owner Name" },
          { key: "natureOfBusiness", label: "Nature of Business" },
        ],
      },
      {
        title: "Technical Details & Notes",
        icon: CloudLightning,
        colorClass: "text-amber-500",
        fields: [
          { key: "structureType", label: "Structure Type" },
          { key: "powerSource", label: "Power Source" },
          { key: "upsAvailable", label: "UPS Available", type: "select", options: BOOLEAN_OPTIONS },
          { key: "upsCapacity", label: "UPS Capacity" },
          { key: "backupCapacity", label: "Backup Capacity" },
          { key: "bandwidth", label: "Bandwidth" },
          { key: "notes", label: "Notes", type: "textarea" },
        ],
      },
    ];
  }, [isPop, isCustomer]);

  // Populate form values from approval data
  useEffect(() => {
    if (!fd) return;
    const initial: Record<string, string> = {};
    sections.forEach((sec) => {
      sec.fields.forEach((f) => {
        const val = f.isTopLevel
          ? (fd as Record<string, unknown>)[f.key]
          : props[f.key];
        initial[f.key] = val !== undefined && val !== null ? String(val) : "";
      });
    });
    setFormValues(initial);
  }, [approval, sections]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!approval || !fd) return;
    setSaving(true);
    try {
      const updatedProperties: Record<string, unknown> = { ...props };
      const updatedFormData: Record<string, unknown> = { ...fd };

      sections.forEach((sec) => {
        sec.fields.forEach((f) => {
          const val = formValues[f.key];
          let parsed: unknown = val;
          if (f.type === "number" && val) {
            parsed = Number(val);
          } else if (f.type === "select" && f.options === BOOLEAN_OPTIONS) {
            parsed = val === "true" ? true : val === "false" ? false : null;
          }
          if (f.isTopLevel) {
            updatedFormData[f.key] = parsed;
          } else {
            updatedProperties[f.key] = parsed;
          }
        });
      });

      updatedFormData.properties = updatedProperties;

      await networkPlanningService.editSubmission(
        (approval as Record<string, unknown>).id as number,
        updatedFormData
      );
      onSaved();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save";
      showToast.error("Edit failed: " + errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!approval) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-8xl max-h-[97vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/60 dark:border-gray-700/60 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl shadow-inner">
                <Pencil className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Submission Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {fd?.name as string || "Unnamed"} — Correct the information before final approval
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
            >
              <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
            </button>
          </div>

          {/* Form Body - Grouped by Sections */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <section key={idx} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                    <Icon className={`w-5 h-5 ${section.colorClass}`} />
                    {section.title}
                  </h3>
                  {section.fields.some(f => f.key === "latitude") && (
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="w-full py-2.5 mt-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" /> Click to Place on Map
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {section.fields.map((field) => (
                      <div
                        key={field.key}
                        className={field.type === "textarea" ? "md:col-span-2 lg:col-span-3" : ""}
                      >
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={formValues[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all shadow-sm"
                          />
                        ) : field.type === "select" && field.options ? (
                          <select
                            value={formValues[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                          >
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === "number" ? "number" : "text"}
                            step={field.type === "number" ? "any" : undefined}
                            value={formValues[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/60 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2.5 font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/30"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Map Picker Modal */}
      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(lat, lng) => {
          handleChange("latitude", lat.toString());
          handleChange("longitude", lng.toString());
          setIsMapOpen(false);
        }}
        initialLat={formValues.latitude || undefined}
        initialLng={formValues.longitude || undefined}
      />
    </AnimatePresence>,
    document.body
  );
};

export default ApprovalEditModal;

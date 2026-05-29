import React, { useState, useEffect, memo } from "react";
import {
  X,
  Save,
  MapPin,
  Loader2,
  Clock,
  User,
  Building2,
  Phone,
  FileText,
  CloudLightning,
} from "lucide-react";
import { networkPlanningService } from "../../services/api";
import LocationPickerModal from "../NetworkMap/LocationPickerModal";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { motion, AnimatePresence } from "framer-motion";
import {
  STATUS_OPTIONS,
  STRUCTURE_TYPE_OPTIONS,
  POWER_SOURCE_OPTIONS,
} from "../Shared/formConstants";

// Reusing InputField for consistency
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  width?: string;
}

const InputField: React.FC<InputFieldProps> = memo(
  ({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    type = "text",
    width = "w-full",
  }) => (
    <div className={width}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
      />
    </div>
  ),
);

interface EditInfrastructureModalProps {
  isOpen: boolean;
  featureId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const EditInfrastructureModal: React.FC<EditInfrastructureModalProps> = ({
  isOpen,
  featureId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Full state matching AddInfrastructureForm
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    status: "Active",
    height: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    contactName: "",
    phone: "",
    email: "",
    isRented: false,
    monthlyRent: "",
    agreementStart: "",
    agreementEnd: "",
    landlordName: "",
    landlordContact: "",
    ownerName: "",
    natureOfBusiness: "",
    structureType: "Tower",
    powerSource: "Grid",
    upsAvailable: false,
    upsCapacity: "",
    backupCapacity: "",
    bandwidth: "",
    notes: "", // Mapped from 'remarks' or 'notes'
  });

  const [auditInfo, setAuditInfo] = useState<{
    createdBy: string;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string | null;
  } | null>(null);

  // Load feature data
  useEffect(() => {
    if (isOpen && featureId) {
      loadFeature();
    }
  }, [isOpen, featureId]);

  const loadFeature = async () => {
    setLoading(true);
    setError(null);
    try {
      const feature = await networkPlanningService.getFeature(featureId) as { properties?: Record<string, unknown>, status?: string, name?: string, latitude?: number, longitude?: number, created_by_name?: string, updated_by_name?: string, created_at?: string, updated_at?: string };
      const props = feature.properties || {};

      setFormData({
        name: (props.name as string) || "",
        latitude: feature.latitude?.toString() || "",
        longitude: feature.longitude?.toString() || "",
        status: (props.status as string) || "Active",
        height: (props.height as string) || "",
        street: (props.street as string) || "",
        city: (props.city as string) || "",
        state: (props.state as string) || "",
        pincode: (props.pincode as string) || "",
        contactName: (props.contactName as string) || "",
        phone: (props.phone as string) || "",
        email: (props.email as string) || "",
        isRented: (props.isRented as boolean) || false,
        monthlyRent: (props.monthlyRent as string) || "",
        agreementStart: (props.agreementStart as string) || "",
        agreementEnd: (props.agreementEnd as string) || "",
        landlordName: (props.landlordName as string) || "",
        landlordContact: (props.landlordContact as string) || "",
        ownerName: (props.ownerName as string) || "",
        natureOfBusiness: (props.natureOfBusiness as string) || "",
        structureType: (props.structureType as string) || "Tower",
        powerSource: (props.powerSource as string) || "Grid",
        upsAvailable: (props.upsAvailable as boolean) || false,
        upsCapacity: (props.upsCapacity as string) || "",
        backupCapacity: (props.backupCapacity as string) || "",
        bandwidth: (props.bandwidth as string) || "",
        notes: (props.notes as string) || (props.remarks as string) || "", // Handle both keys if present
      });

      setAuditInfo({
        createdBy: feature.created_by_name || "Unknown",
        createdAt: feature.created_at
          ? new Date(feature.created_at).toLocaleString()
          : "Unknown",
        updatedBy: feature.updated_by_name || null,
        updatedAt: feature.updated_at
          ? new Date(feature.updated_at).toLocaleString()
          : null,
      });
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load feature");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Send entire formData object. properties will be merged in backend.
      // Lat/Long are handled specifically by backend but sent here as part of object for simplicity.
      await networkPlanningService.updateFeature(featureId, formData);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update feature");
    } finally {
      setSaving(false);
    }
  };

  const handleLocationConfirm = (
    lat: number | string,
    lng: number | string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat).toFixed(6),
      longitude: Number(lng).toFixed(6),
    }));
    setIsMapOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ✏️ Edit Infrastructure
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
          >
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={loadFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Audit Info - Compact Banner */}
              {auditInfo && (
                <div className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg p-4 shadow-sm text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>
                      Created by <strong>{auditInfo.createdBy}</strong>
                    </span>
                    <span className="text-gray-400">|</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{auditInfo.createdAt}</span>
                  </div>
                  {auditInfo.updatedBy && (
                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-right">
                      Last edited by <strong>{auditInfo.updatedBy}</strong>
                      <br />
                      {auditInfo.updatedAt}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: Basic Information */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Basic
                  Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={formData.status}
                    onChange={(v) => handleSelectChange("status", v)}
                  />
                  <InputField
                    label="Infrastructure Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai Central POP"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="whitespace-nowrap px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" /> Pick on Map
                    </button>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Latitude"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                    />
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Longitude"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                    />
                  </div>
                </div>

                <InputField
                  label="Height (meters)"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g., 45"
                />
              </section>

              {/* SECTION: Address */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Address
                </h3>
                <InputField
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-3 gap-4">
                  <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* SECTION: Contact */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <Phone className="w-5 h-5 text-indigo-500" /> Contact Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Contact Person"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    width="md:col-span-2"
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                  />
                </div>
              </section>

              {/* SECTION: Rental */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <User className="w-5 h-5 text-indigo-500" /> Rental Info
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRented"
                    name="isRented"
                    checked={formData.isRented}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <label
                    htmlFor="isRented"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none"
                  >
                    This is a rented site
                  </label>
                </div>
                <AnimatePresence>
                  {formData.isRented && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4 pl-1"
                    >
                      <InputField
                        label="Monthly Rent (₹)"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleChange}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Start Date"
                          name="agreementStart"
                          value={formData.agreementStart}
                          onChange={handleChange}
                          type="date"
                        />
                        <InputField
                          label="End Date"
                          name="agreementEnd"
                          value={formData.agreementEnd}
                          onChange={handleChange}
                          type="date"
                        />
                      </div>
                      <InputField
                        label="Landlord Name"
                        name="landlordName"
                        value={formData.landlordName}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Landlord Contact"
                        name="landlordContact"
                        value={formData.landlordContact}
                        onChange={handleChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* SECTION: Ownership */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Ownership
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Owner Name"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Nature of Business"
                    name="natureOfBusiness"
                    value={formData.natureOfBusiness}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* SECTION: Technical */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <CloudLightning className="w-5 h-5 text-indigo-500" />{" "}
                  Technical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Structure Type"
                    options={STRUCTURE_TYPE_OPTIONS}
                    value={formData.structureType}
                    onChange={(v) => handleSelectChange("structureType", v)}
                  />
                  <CustomSelect
                    label="Power Source"
                    options={POWER_SOURCE_OPTIONS}
                    value={formData.powerSource}
                    onChange={(v) => handleSelectChange("powerSource", v)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="upsAvailable"
                      name="upsAvailable"
                      checked={formData.upsAvailable}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <label
                      htmlFor="upsAvailable"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none"
                    >
                      UPS Available
                    </label>
                  </div>
                  <AnimatePresence>
                    {formData.upsAvailable && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4 pl-1"
                      >
                        <InputField
                          label="UPS Capacity"
                          name="upsCapacity"
                          value={formData.upsCapacity}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Backup Capacity"
                          name="backupCapacity"
                          value={formData.backupCapacity}
                          onChange={handleChange}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <InputField
                  label="Bandwidth"
                  name="bandwidth"
                  value={formData.bandwidth}
                  onChange={handleChange}
                />
              </section>

              {/* SECTION: Additional */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Remarks
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Additional notes..."
                />
              </section>
            </form>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}

        {/* Location Picker Modal */}
        <LocationPickerModal
          isOpen={isMapOpen}
          initialLat={formData.latitude || "28.6139"}
          initialLng={formData.longitude || "77.209"}
          onClose={() => setIsMapOpen(false)}
          onConfirm={handleLocationConfirm}
        />
      </div>
    </div>
  );
};

export default EditInfrastructureModal;


import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Hash,
  Building2,
  CloudLightning,
  Phone,
  Mail,
  History,
  RefreshCw,
  Trash2,
  Pencil,
} from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../../../../store";
import { networkPlanningService } from "../../services/api";
import ApprovalEditModal from "./ApprovalEditModal";
import { showToast } from "../../../../utils/toastUtils";

const InfraApprovalDashboard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const canDeleteApprovalHistory =
    user?.role === "admin" ||
    user?.permissions?.includes("network:infra:delete_approval_history" as any) ||
    user?.directPermissions?.includes("network:infra:delete_approval_history");

  const [approvals, setApprovals] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Modals
  const [approveModal, setApproveModal] = useState<{
    id: number;
    name: string;
    status: string;
  } | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteHistoryModal, setDeleteHistoryModal] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingData, historyData] = await Promise.all([
        networkPlanningService.getPendingApprovals(),
        networkPlanningService.getApprovalHistory(),
      ]);
      setApprovals(pendingData);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    if (!approveModal) return;
    setProcessing(approveModal.id);
    try {
      await networkPlanningService.approveSubmission(approveModal.id);
      setApproveModal(null);
      fetchData();
    } catch (err: any) {
      showToast.error("Failed to approve: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      showToast.warning("Please enter a rejection reason");
      return;
    }
    setProcessing(rejectModal.id);
    try {
      await networkPlanningService.rejectSubmission(
        rejectModal.id,
        rejectReason.trim(),
      );
      setRejectModal(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      showToast.error("Failed to reject: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteHistory = async () => {
    if (!deleteHistoryModal) return;
    setProcessing(deleteHistoryModal.id);
    try {
      await networkPlanningService.deleteSubmission(deleteHistoryModal.id);
      setDeleteHistoryModal(null);
      fetchData();
    } catch (err: any) {
      showToast.error("Failed to delete history item: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon: any; label: string }
    > = {
      pending_planned: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: Clock,
        label: "New Submission",
      },
      pending_active: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-700 dark:text-orange-400",
        icon: Hash,
        label: "Circuit ID Added",
      },
      pending_resubmitted: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        icon: RefreshCw,
        label: "Resubmitted",
      },
      planned: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: CheckCircle2,
        label: "Planned",
      },
      active: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle2,
        label: "Active",
      },
      rejected: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: XCircle,
        label: "Rejected",
      },
    };
    const s = styles[status] || styles.pending_planned;
    const Icon = s.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
      >
        <Icon className="w-3 h-3" />
        {s.label}
      </span>
    );
  };

  // Render full form details grid for a submission
  const renderFullDetails = (fd: any, approval: any) => {
    const props = fd?.properties || fd || {};
    const folderPath = (approval.folder_path || approval.folder_name || "").toLowerCase();
    const isCustomer = folderPath.includes("customer");
    const isPop = !isCustomer && (folderPath.includes("> pop >") || folderPath.includes("> pop") || props.type === "POP" || fd?.iconType?.toLowerCase() === "pop");
    const isGenericInfra = !isCustomer && !isPop;

    const sections = [];

    // ── POP Form ──
    if (isPop) {
      sections.push({
        title: "POP Details",
        icon: Building2,
        fields: [
          { label: "Name", value: fd?.name },
          { label: "POP ID", value: props.popId },
          { label: "POP Type", value: props.popType },
          { label: "Site ID", value: props.siteId },
          { label: "Infra Provider", value: props.infraProvider },
          { label: "RL Number", value: props.referenceNumber },
          { label: "BTS Type", value: props.btsType },
          { label: "GBT Tower Height", value: props.gbtTowerHeight, suffix: "m" },
          { label: "RTT Tower Height", value: props.rttTowerHeight, suffix: "m" },
          { label: "RTT Building Height", value: props.rttBuildingHeight, suffix: "m" },
        ]
      });
      sections.push({
        title: "Location",
        icon: MapPin,
        fields: [
          { label: "Coordinates", value: fd?.latitude && fd?.longitude ? `${fd.latitude}, ${fd.longitude}` : null },
          { label: "Height", value: props.height, suffix: "m" },
          { label: "Region", value: props.region },
          { label: "Country", value: props.country },
          { label: "State", value: props.state },
          { label: "District", value: props.district },
          { label: "City/Village", value: props.city },
          { label: "Area", value: props.area },
        ]
      });
      sections.push({
        title: "Site Information",
        icon: CloudLightning,
        fields: [
          { label: "Rack Type", value: props.rackType },
          { label: "Power Source", value: props.powerSource },
          { label: "Phase", value: props.powerPhase },
          { label: "Power Provider", value: props.powerProvider },
          { label: "AC Availability", value: props.acAvailability ? "Yes" : props.acAvailability === false ? "No" : null },
        ]
      });
      sections.push({
        title: "Contact Information",
        icon: Phone,
        fields: [
          { label: "Rack Space", value: props.rackSpace },
          { label: "UBR Mounting Permission", value: props.ubrMountingPermission },
          { label: "Technician Name", value: props.technicianName },
          { label: "Technician Number", value: props.technicianNumber },
          { label: "Supervisor Name", value: props.supervisorName },
          { label: "Supervisor Number", value: props.supervisorNumber },
        ]
      });
    }

    // ── Customer Form ──
    if (isCustomer) {
      sections.push({
        title: "Basic Info",
        icon: Building2,
        fields: [
          { label: "Name", value: fd?.name },
          { label: "Location", value: fd?.latitude && fd?.longitude ? `${fd.latitude}, ${fd.longitude}` : null },
        ]
      });
      sections.push({
        title: "Circuit Details",
        icon: Hash,
        fields: [
          { label: "Circuit Name", value: props.circuitName },
          { label: "Product Type", value: props.productType },
          { label: "Connected Infra", value: props.connectedPop },
          { label: "Bandwidth", value: props.bandwidth },
          { label: "Media Type", value: props.mediaType },
        ]
      });
      sections.push({
        title: "Customer Address",
        icon: MapPin,
        fields: [
          { label: "Physical Address", value: props.customerAddress },
          { label: "Region", value: props.region },
          { label: "State", value: props.state },
          { label: "District", value: props.district },
          { label: "City/Village", value: props.city },
          { label: "Pincode", value: props.pincode },
        ]
      });
    }

    // ── Generic Infrastructure Form (BTS, NNI, Data Center, etc.) ──
    if (isGenericInfra) {
      sections.push({
        title: "Basic Info",
        icon: Building2,
        fields: [
          { label: "Name", value: fd?.name },
          { label: "Location", value: fd?.latitude && fd?.longitude ? `${fd.latitude}, ${fd.longitude}` : null },
          { label: "Height", value: props.height, suffix: "m" },
        ]
      });
      sections.push({
        title: "Address",
        icon: MapPin,
        fields: [
          { label: "Street Address", value: props.street },
          { label: "City", value: props.city },
          { label: "State", value: props.state },
          { label: "Pincode", value: props.pincode },
        ]
      });
      sections.push({
        title: "Contact Information",
        icon: Phone,
        fields: [
          { label: "Contact Person", value: props.contactName },
          { label: "Phone Number", value: props.phone },
          { label: "Email", value: props.email },
        ]
      });
      sections.push({
        title: "Rental Information",
        icon: Building2,
        fields: [
          { label: "Rented", value: props.isRented ? "Yes" : props.isRented === false ? "No" : null },
          { label: "Monthly Rent", value: props.monthlyRent, prefix: "₹" },
          { label: "Agreement Start", value: props.agreementStart },
          { label: "Agreement End", value: props.agreementEnd },
          { label: "Landlord Name", value: props.landlordName },
          { label: "Landlord Contact", value: props.landlordContact },
        ]
      });
      sections.push({
        title: "Owner & Business",
        icon: User,
        fields: [
          { label: "Owner Name", value: props.ownerName },
          { label: "Nature of Business", value: props.natureOfBusiness },
        ]
      });
      sections.push({
        title: "Technical Details",
        icon: CloudLightning,
        fields: [
          { label: "Structure Type", value: props.structureType },
          { label: "Power Source", value: props.powerSource },
          { label: "UPS Available", value: props.upsAvailable ? "Yes" : props.upsAvailable === false ? "No" : null },
          { label: "UPS Capacity", value: props.upsCapacity },
          { label: "Backup Capacity", value: props.backupCapacity },
          { label: "Bandwidth", value: props.bandwidth },
        ]
      });
    }

    return (
      <div className="space-y-4">
        {sections.map((section) => {
          const typedFields = section.fields as Array<{
            label: string;
            value: any;
            prefix?: string;
            suffix?: string;
          }>;
          const validFields = typedFields.filter(f => f.value !== undefined && f.value !== null && f.value !== "" && f.value !== "-");
          if (validFields.length === 0) return null;

          const SectionIcon = section.icon;
          return (
            <div key={section.title}>
              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <SectionIcon className="w-3.5 h-3.5" />
                {section.title}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {validFields.map((field) => {
                  return (
                    <div
                      key={field.label}
                      className="bg-gray-50 dark:bg-gray-900/40 rounded-lg px-3 py-2"
                    >
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                        {field.label}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {(field as any).prefix ? (field as any).prefix : ""}
                        {String(field.value)}
                        {(field as any).suffix ? (field as any).suffix : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Circuit ID & Activation Date */}
        {approval.circuit_id && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider block mb-0.5">
                Circuit ID
              </span>
              <p className="text-sm font-bold text-green-700 dark:text-green-400">
                {approval.circuit_id}
              </p>
            </div>
            {props.activationDate && (
              <>
                <div className="w-px h-8 bg-green-200 dark:bg-green-800"></div>
                <div>
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider block mb-0.5">
                    Activation Date
                  </span>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">
                    {props.activationDate}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notes */}
        {props.notes && (
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg px-3 py-2">
            <span className="text-[10px] font-medium text-gray-400 uppercase">
              Notes
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
              {props.notes}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span>
            Submitted:{" "}
            {new Date(approval.created_at).toLocaleString()}
          </span>
          {approval.approved_by_full_name && (
            <span>
              Reviewed by: {approval.approved_by_full_name}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20 space-y-6">
      {/* Pending Approvals */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Infrastructure Approvals
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Review and approve infrastructure submissions from Project
                Managers.
              </p>
            </div>
            {approvals.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-bold px-3 py-1.5 rounded-full">
                {approvals.length} Pending
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {approvals.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All caught up!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                No pending approvals at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => {
                const fd = approval.form_data;
                const isExpanded = expandedId === approval.id;
                const isProcessing = processing === approval.id;

                return (
                  <div
                    key={approval.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                  >
                    {/* Header Row */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : approval.id)
                      }
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {fd?.name || "Unnamed"}
                            </h4>
                            {getStatusBadge(approval.status)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {approval.folder_path || approval.folder_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          <User className="w-3.5 h-3.5" />
                          <span>
                            {approval.submitted_by_full_name ||
                              approval.submitted_by_name}
                          </span>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 ml-3" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-3" />
                      )}
                    </div>

                    {/* Expanded: Full Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                            {renderFullDetails(fd, approval)}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <button
                                onClick={() =>
                                  setApproveModal({
                                    id: approval.id,
                                    name: fd?.name || "Unnamed",
                                    status: approval.status,
                                  })
                                }
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white font-semibold bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {approval.status === "pending_active"
                                  ? "Approve & Activate"
                                  : "Approve"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditModal(approval);
                                }}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    id: approval.id,
                                    name: fd?.name || "Unnamed",
                                  })
                                }
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approval History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Approval History
            </h3>
            {history.length > 0 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-3">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                    No approval history yet.
                  </p>
                ) : (
                  (() => {
                    const groupedHistory = history.reduce((acc, item) => {
                      // Check both updated_at and created_at just in case
                      const dateObj = new Date(item.updated_at || item.created_at || Date.now());
                      // Format date nicely: e.g., "March 10, 2026"
                      const date = dateObj.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(item);
                      return acc;
                    }, {} as Record<string, any[]>);

                    return Object.entries(groupedHistory).map(([date, items]) => (
                      <div key={date} className="mb-6 last:mb-0">
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {date}
                        </h4>
                        <div className="space-y-3">
                          {(items as any[]).map((item: any) => {
                            const fd = item.form_data;
                            const isExpanded = expandedHistoryId === item.id;
                            return (
                              <div
                                key={item.id}
                                className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                              >
                                <div
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                  onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                        {fd?.name || "Unnamed"}
                                      </h4>
                                      {getStatusBadge(item.status)}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                      {item.folder_path || item.folder_name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right hidden sm:block">
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.submitted_by_full_name}
                                      </p>
                                      <p className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(item.updated_at).toLocaleTimeString()}
                                      </p>
                                      {item.approved_by_full_name && (
                                        <p className="text-[10px] text-gray-400">
                                          by {item.approved_by_full_name}
                                        </p>
                                      )}
                                    </div>
                                    {canDeleteApprovalHistory && (
                                      <button
                                        type="button"
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors border my-auto border-transparent hover:border-red-200 dark:hover:border-red-800 -mr-1"
                                        title="Delete from History"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteHistoryModal({ id: item.id, name: fd?.name || "Unnamed" });
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                        {renderFullDetails(fd, item)}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Approve Modal */}
      {createPortal(
      <AnimatePresence>
        {approveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setApproveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {approveModal.status === "pending_active"
                      ? "Approve & Activate"
                      : "Approve Submission"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {approveModal.name}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                {approveModal.status === "pending_active"
                  ? "This will activate the infrastructure and make it visible as Active on the map."
                  : "This will mark the infrastructure as Planned and make it visible on the map."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setApproveModal(null)}
                  className="flex-1 py-2.5 text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing !== null}
                  className="flex-1 py-2.5 text-white font-semibold bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}

      {/* Reject Modal */}
      {createPortal(
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Reject Submission
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rejectModal.name}
                  </p>
                </div>
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for rejection..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                autoFocus
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  className="flex-1 py-2.5 text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processing !== null}
                  className="flex-1 py-2.5 text-white font-semibold bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}

      {/* Delete History Modal */}
      {createPortal(
      <AnimatePresence>
        {deleteHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setDeleteHistoryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Delete History Item</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">"{deleteHistoryModal.name}"</strong> from the approval history? This action cannot be undone.
              </p>
              
              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteHistoryModal(null)}
                  disabled={processing !== null}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteHistory}
                  disabled={processing !== null}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {processing === deleteHistoryModal.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}

      {/* Edit Modal */}
      <ApprovalEditModal
        approval={editModal}
        onClose={() => setEditModal(null)}
        onSaved={() => {
          setEditModal(null);
          fetchData();
        }}
      />
    </div>
  );
};

export default InfraApprovalDashboard;

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  XCircle,
  Hash,
  Clock,
  Building2,
  MapPin,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  User,
  Trash2,
} from "lucide-react";
import { useAppSelector } from "../../../../store";
import { networkPlanningService } from "../../services/api";
import { showToast } from "../../../../utils/toastUtils";

interface MySubmissionsListProps {
  onEditRequest: (id: number, data: any) => void;
  hideHeader?: boolean;
}

const renderFullDetails = (props: any, approval: any) => {
    const folderPath = (approval.folder_path || approval.folder_name || "").toLowerCase();
    const isCustomer = folderPath.includes("customer");
    const isPop = !isCustomer && (folderPath.includes("> pop >") || folderPath.includes("> pop") || props.type === "POP" || approval.form_data?.iconType?.toLowerCase() === "pop");
    const isGenericInfra = !isCustomer && !isPop;

    const sections = [];

    // ── POP Form ──
    if (isPop) {
      sections.push({
        title: "POP Details",
        fields: [
          { label: "Name", value: props.name },
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
        fields: [
          { label: "Coordinates", value: props.latitude && props.longitude ? `${props.latitude}, ${props.longitude}` : "" },
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
        fields: [
          { label: "Rack Type", value: props.rackType },
          { label: "Power Source", value: props.powerSource },
          { label: "Phase", value: props.powerPhase },
          { label: "Power Provider", value: props.powerProvider },
          { label: "AC Availability", value: props.acAvailability ? "Yes" : props.acAvailability === false ? "No" : "" },
        ]
      });
      sections.push({
        title: "Contact Information",
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
        fields: [
          { label: "Name", value: props.name },
          { label: "Location", value: props.latitude && props.longitude ? `${props.latitude}, ${props.longitude}` : "" },
        ]
      });
      sections.push({
        title: "Circuit Details",
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
        fields: [
          { label: "Name", value: props.name },
          { label: "Location", value: props.latitude && props.longitude ? `${props.latitude}, ${props.longitude}` : "" },
          { label: "Height", value: props.height, suffix: "m" },
        ]
      });
      sections.push({
        title: "Address",
        fields: [
          { label: "Street Address", value: props.street },
          { label: "City", value: props.city },
          { label: "State", value: props.state },
          { label: "Pincode", value: props.pincode },
        ]
      });
      sections.push({
        title: "Contact Information",
        fields: [
          { label: "Contact Person", value: props.contactName },
          { label: "Phone Number", value: props.phone },
          { label: "Email", value: props.email },
        ]
      });
      sections.push({
        title: "Rental Information",
        fields: [
          { label: "Rented", value: props.isRented ? "Yes" : props.isRented === false ? "No" : "" },
          { label: "Monthly Rent", value: props.monthlyRent, prefix: "₹" },
          { label: "Agreement Start", value: props.agreementStart },
          { label: "Agreement End", value: props.agreementEnd },
          { label: "Landlord Name", value: props.landlordName },
          { label: "Landlord Contact", value: props.landlordContact },
        ]
      });
      sections.push({
        title: "Owner & Business",
        fields: [
          { label: "Owner Name", value: props.ownerName },
          { label: "Nature of Business", value: props.natureOfBusiness },
        ]
      });
      sections.push({
        title: "Technical Details",
        fields: [
          { label: "Structure Type", value: props.structureType },
          { label: "Power Source", value: props.powerSource },
          { label: "UPS Available", value: props.upsAvailable ? "Yes" : props.upsAvailable === false ? "No" : "" },
          { label: "UPS Capacity", value: props.upsCapacity },
          { label: "Backup Capacity", value: props.backupCapacity },
          { label: "Bandwidth", value: props.bandwidth },
        ]
      });
    }

    if (props.notes) {
      sections.push({
        title: "Notes",
        fields: [{ label: "Notes", value: props.notes }]
      });
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
      {sections.map((section) => {
        const validFields = (section.fields as any[]).filter((field: any) => field.value !== undefined && field.value !== null && field.value !== "" && field.value !== "-");
        if (validFields.length === 0) return null;

        return (
          <div key={section.title} className="space-y-2">
            <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {section.title}
            </h5>
            <div className="space-y-1.5">
              {validFields.map((field: any) => {
                return (
                  <div key={field.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{field.label}:</span>
                    <span className="font-medium text-right text-gray-900 dark:text-white">
                      {(field as any).prefix || ""}
                      {String(field.value)}
                      {(field as any).suffix || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Footer Meta */}
      <div className="md:col-span-3 mt-2 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
          <Clock className="w-4 h-4 text-sky-500" />
          <span className="opacity-80">Submitted:</span> 
          <span className="font-semibold">{new Date(approval.created_at).toLocaleString()}</span>
        </span>
        {approval.approved_by_full_name && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <User className="w-4 h-4 text-emerald-500" />
            <span className="opacity-80">Approved by:</span> 
            <span className="font-semibold">{approval.approved_by_full_name}</span>
          </span>
        )}
      </div>
    </div>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending_planned":
      return <span className="bg-yellow-100/80 text-yellow-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-yellow-200">Pending Planning</span>;
    case "pending_resubmitted":
      return <span className="bg-orange-100/80 text-orange-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-orange-200">Resubmitted</span>;
    case "planned":
      return <span className="bg-blue-100/80 text-blue-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-blue-200">Planned</span>;
    case "active":
      return <span className="bg-green-100/80 text-green-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-green-200">Active</span>;
    case "rejected":
      return <span className="bg-red-100/80 text-red-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-red-200">Rejected</span>;
    default:
      return <span className="bg-gray-100/80 text-gray-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-gray-200">{status}</span>;
  }
};

const SubmissionSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg ml-6" />
        <div className="space-y-3">
          {[1, 2].map((j) => (
            <div key={j} className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 ml-6" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const MySubmissionsList: React.FC<MySubmissionsListProps> = ({ onEditRequest, hideHeader = false }) => {
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [circuitIdInput, setCircuitIdInput] = useState<Record<number, string>>({});
  const [activationDateInput, setActivationDateInput] = useState<Record<number, string>>({});
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  const toggleExpand = (id: number) => {
    const newExp = new Set(expandedIds);
    if (newExp.has(id)) newExp.delete(id);
    else newExp.add(id);
    setExpandedIds(newExp);
  };

  const { user } = useAppSelector((state: any) => state.auth);
  const canDeleteSubmissions =
    user?.role === "admin" ||
    user?.permissions?.includes("network:infra:delete" as any) ||
    user?.directPermissions?.includes("network:infra:delete");

  const canDeleteSubmissionHistory =
    user?.role === "admin" ||
    user?.permissions?.includes("network:infra:delete_submission_history" as any) ||
    user?.directPermissions?.includes("network:infra:delete_submission_history");

  const fetchMySubmissions = useCallback(async () => {
    setIsLoading(true);
    const delay = new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const resp = await networkPlanningService.getMySubmissions();
      await delay;
      setMySubmissions(Array.isArray(resp) ? resp : (resp as any).data || []);
    } catch (err: any) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMySubmissions();
  }, [fetchMySubmissions]);

  const handleAddCircuitId = async (approvalId: number) => {
    const circuitId = circuitIdInput[approvalId];
    const activationDate = activationDateInput[approvalId];
    if (!circuitId) {
      showToast.warning("Please enter a Circuit ID");
      return;
    }
    if (!activationDate) {
      showToast.warning("Please enter an Activation Date");
      return;
    }
    try {
      await networkPlanningService.addCircuitId(approvalId, circuitId, activationDate);
      setCircuitIdInput((prev) => ({ ...prev, [approvalId]: "" }));
      setActivationDateInput((prev) => ({ ...prev, [approvalId]: "" }));
      showToast.success("Circuit Added and Activation Date added");
      fetchMySubmissions();
    } catch (err: any) {
      showToast.error("Failed to add Circuit ID: " + err.message);
    }
  };

  const handleEditClick = (sub: any) => {
    const fd = sub.form_data;
    const props = fd?.properties || fd || {};
    onEditRequest(sub.id, {
      ...props,
      name: fd.name || props.name || "",
      latitude: fd.latitude?.toString() || props.latitude?.toString() || "",
      longitude: fd.longitude?.toString() || props.longitude?.toString() || "",
    });
  };

  if (
    !(
      user?.role === "admin" ||
      user?.permissions?.includes("network:infra:submissions" as any) ||
      user?.directPermissions?.includes("network:infra:submissions")
    )
  ) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Access Denied</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to view submission history.</p>
      </div>
    );
  }

  const filteredSubmissions = mySubmissions.filter((sub) => {
    const nameMatch = (sub.form_data?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "all" || sub.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const groupedSubmissions = filteredSubmissions.reduce((acc, sub) => {
    const d = new Date(sub.created_at);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey = "";
    if (d.getTime() === today.getTime()) groupKey = "Today";
    else if (d.getTime() === yesterday.getTime()) groupKey = "Yesterday";
    else groupKey = d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(sub);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between px-2 text-gray-900 dark:text-white mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <Clock className="w-5 h-5 text-teal-500" />
            Submission History
            <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs py-0.5 px-2.5 rounded-full">{mySubmissions.length}</span>
          </h3>
          <button
            onClick={fetchMySubmissions}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isLoading 
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 cursor-not-allowed" 
                : "text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            }`}
            title={isLoading ? "Refreshing..." : "Refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 px-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="relative w-full sm:w-48 shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Statuses</option>
            <option value="pending_planned">Pending Approval</option>
            <option value="pending_resubmitted">Resubmitted</option>
            <option value="planned">Planned</option>
            <option value="pending_active">Pending Activation</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading submissions...</span>
          </div>
        ) : Object.keys(groupedSubmissions).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 border-dashed p-12 text-center">
            <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No submissions match your filters.</p>
          </div>
        ) : (
          Object.entries(groupedSubmissions).map(([groupKey, subs]) => {
            const isCollapsed = collapsedGroups.has(groupKey);
            return (
              <div key={groupKey}>
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 pt-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4 flex items-center justify-between group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3.5 h-3.5 ${
                      groupKey === "Today" ? "text-emerald-500" :
                      groupKey === "Yesterday" ? "text-amber-500" :
                      "text-indigo-400"
                    }`} />
                    <span className={`text-[13px] font-semibold ${
                      groupKey === "Today" ? "text-emerald-600 dark:text-emerald-400" :
                      groupKey === "Yesterday" ? "text-amber-600 dark:text-amber-400" :
                      "text-gray-600 dark:text-gray-400"
                    }`}>
                      {groupKey}
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full">
                      {(subs as any[]).length}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden space-y-4"
                    >
                      {(subs as any[]).map((sub: any) => {
                        const fd = sub.form_data;
                        const props = fd?.properties || fd || {};
                        const isExpanded = expandedIds.has(sub.id);

                        return (
                          <div
                            key={sub.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm group relative overflow-hidden"
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                              sub.status === 'rejected' ? 'bg-red-500' :
                              sub.status === 'active' ? 'bg-green-500' :
                              sub.status === 'planned' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`} />

                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 pl-2 cursor-pointer select-none" onClick={() => toggleExpand(sub.id)}>
                                <div className="flex items-center gap-3 mb-1">
                                  {getStatusBadge(sub.status)}
                                  <span className="text-xs text-gray-400 font-medium font-mono">
                                    {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  <Building2 className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                                  {fd?.name || "Unnamed Asset"}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                    {fd?.latitude}, {fd?.longitude}
                                  </span>
                                  {sub.folder_path && (
                                    <span className="flex items-center gap-1.5 truncate max-w-xs cursor-help bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700" title={sub.folder_path}>🏷️ {sub.folder_path.split("/").pop()}</span>
                                  )}
                                  {sub.circuit_id && (
                                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-800">🔗 {sub.circuit_id}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-3 shrink-0">
                                <button type="button" onClick={() => toggleExpand(sub.id)} className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-indigo-900/40 p-2 rounded-xl transition-all border border-gray-200 dark:border-gray-600 shadow-sm">
                                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180 text-indigo-500" : ""}`} />
                                </button>
                                <div className="flex flex-col items-end gap-2">
                                  {canDeleteSubmissions && ["pending_planned", "pending_resubmitted"].includes(sub.status) && (
                                    <button type="button" onClick={() => setDeleteModal({ id: sub.id, name: fd?.name || "Unnamed" })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-transparent hover:border-red-200"><XCircle className="w-4 h-4" /> Cancel Request</button>
                                  )}
                                  {canDeleteSubmissionHistory && ["planned", "active", "rejected"].includes(sub.status) && (
                                    <button type="button" onClick={() => setDeleteModal({ id: sub.id, name: fd?.name || "Unnamed" })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-transparent hover:border-red-200"><Trash2 className="w-4 h-4" /> Delete</button>
                                  )}
                                  {sub.status === "rejected" && (
                                    <button type="button" onClick={() => handleEditClick(sub)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">Edit & Resubmit <ChevronRight className="w-4 h-4" /></button>
                                  )}
                                  {sub.status === "planned" && (
                                    <div className="mt-1 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-end shadow-sm">
                                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Final Details</span>
                                       <div className="flex items-center gap-2">
                                          <div className="relative">
                                            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                              type="text"
                                              value={circuitIdInput[sub.id] || ""}
                                              onChange={(e) => setCircuitIdInput(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                              placeholder="Circuit ID"
                                              className="w-32 pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                          </div>
                                          <div className="relative">
                                            <input
                                              type="date"
                                              value={activationDateInput[sub.id] || ""}
                                              onChange={(e) => setActivationDateInput(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                              className="w-32 px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleAddCircuitId(sub.id)}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                                          >Save</button>
                                       </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">{renderFullDetails(props, sub)}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {sub.status === "rejected" && sub.rejection_reason && (
                              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3 items-start">
                                <div className="bg-red-100 dark:bg-red-800/50 p-2 rounded-lg shrink-0"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
                                <div>
                                  <h5 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider mb-1">Rejection Reason</h5>
                                  <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed font-medium italic">"{sub.rejection_reason}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <XCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Delete Submission</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{deleteModal.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Are you sure you want to permanently delete this submission? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      await networkPlanningService.deleteSubmission(deleteModal.id);
                      setDeleteModal(null);
                      fetchMySubmissions();
                    } catch (err: any) { showToast.error("Failed: " + err.message); }
                  }}
                  className="flex-1 py-2.5 text-white font-semibold bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-all active:scale-95"
                >Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MySubmissionsList;

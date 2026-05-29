import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import {
  Building2,
  MapPin,
  Phone,
  User,
  CloudLightning,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Hash,
  ChevronUp,
  Plus,
  Trash2,
  Server,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../../../../store";
import CustomSelect from "../../../../components/ui/CustomSelect";
import SearchableSelect from "../../../../components/ui/SearchableSelect";
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  STRUCTURE_TYPE_OPTIONS,
  POWER_SOURCE_OPTIONS,
  REGION_OPTIONS,
} from "../Shared/formConstants";
import LocationPickerModal from "../NetworkMap/LocationPickerModal";
import { networkPlanningService } from "../../services/api";

import { getFolderIconKey } from "../NetworkMap/MapIcons";
import { RenderMapIcon } from "../../../../components/ui/RenderMapIcon";
import SubmissionSuccessModal from "../Modals/SubmissionSuccessModal";
import { showToast } from "../../../../utils/toastUtils";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry", "Jammu and Kashmir", "Ladakh"
].map(state => ({ id: state, name: state }));

// Helper to generate a component wrapper for CustomSelect
const getIconComponent = (name: string, defaultIcon?: string) => {
  const iconKey =
    getFolderIconKey({ name, default_icon: defaultIcon }) || "DEFAULT";

  // CustomSelect expects a component, so we return a wrapper
  const IconWrapper: React.FC<{ className?: string }> = ({ className }) => {
    return <RenderMapIcon type={iconKey} className={className} />;
  };
  return IconWrapper;
};

// InputField component defined OUTSIDE to prevent re-creation on each render
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
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  ),
);

const DEFAULT_FORM_STATE = {
  type: "",
  status: "Active",
  name: "",
  latitude: "",
  longitude: "",
  height: "",
  region: "",
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
  circuitId: "",
  notes: "",
  circuitName: "",
  circuitStatus: "Active",
  activationDate: "",
  productType: "",
  connectedPop: "",
  mediaType: "Wireless",
  customerAddress: "",
  district: "",
  inventory: [] as { id: string; type: "Router" | "Switch"; name: string; ips: { id: string; value: string }[] }[],
  popId: "",
  popType: "Infra Provider",
  siteId: "",
  infraProvider: "",
  providerRegion: "",
  providerData: "",
  referenceNumber: "",
  country: "India",
  area: "",
  btsType: "GBT",
  gbtTowerHeight: "",
  rttTowerHeight: "",
  rttBuildingHeight: "",
  ubrMountingPermission: "",
  rackSpace: "",
  rackType: "Indoor",
  acAvailability: false,
  powerPhase: "Single",
  powerProvider: "",
  technicianName: "",
  technicianNumber: "",
  supervisorName: "",
  supervisorNumber: "",
  localSpocName: "",
  localSpocNumber: "",
  chairmanName: "",
  chairmanNumber: "",
};

export interface AddInfrastructureFormProps {
  editingSubmissionId?: number | null;
  initialData?: any | null;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
  hideHeader?: boolean;
}

const AddInfrastructureForm: React.FC<AddInfrastructureFormProps> = ({
  editingSubmissionId = null,
  initialData = null,
  onCancelEdit,
  onSuccess,
  hideHeader = false,
}) => {
  // --- Cascading Dropdown States ---
  const [rootOptions, setRootOptions] = useState<any[]>([]);
  const [level2Options, setLevel2Options] = useState<any[]>([]);
  const [level3Options, setLevel3Options] = useState<any[]>([]);
  const [level4Options, setLevel4Options] = useState<any[]>([]);

  const [selectedRoot, setSelectedRoot] = useState<any>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<any>(null);
  const [selectedLevel3, setSelectedLevel3] = useState<any>(null);
  const [selectedLevel4, setSelectedLevel4] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [popStateFolders, setPopStateFolders] = useState<{id: string; name: string}[]>([]);
  const [selectedPopStateId, setSelectedPopStateId] = useState<string | null>(null);
  const [popList, setPopList] = useState<{id: string; name: string}[]>([]);

  // --- Dynamic Infra Provider States ---
  const [infraProviderFolders, setInfraProviderFolders] = useState<{id: string; name: string}[]>([]);
  const [selectedInfraProviderId, setSelectedInfraProviderId] = useState<string | null>(null);
  const [infraRegionFolders, setInfraRegionFolders] = useState<{id: string; name: string}[]>([]);
  const [selectedInfraRegionId, setSelectedInfraRegionId] = useState<string | null>(null);
  const [infraAvailableData, setInfraAvailableData] = useState<{id: string; name: string}[]>([]);

  // Effects
  useEffect(() => {
    let isActive = true;
    const fetchRoots = async () => {
      try {
        const data = await networkPlanningService.getFolderContents(null, false, "add");
        if (isActive && data.folders) {
          setRootOptions(
            data.folders.map((f) => ({
              label: f.name,
              value: f.id,
              original: f,
            })),
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoots();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    
    // Always clear dependent levels when root selection changes
    setLevel2Options([]);
    setLevel3Options([]);
    setLevel4Options([]);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
    setSelectedLevel4(null);
    
    if (selectedRoot) {
      // Reset type when category changes
      setFormData((prev) => ({ ...prev, type: "" }));

      networkPlanningService
        .getFolderContents(selectedRoot.value, false, "add")
        .then((data) => {
          if (isActive) {
            setLevel2Options(
              data.folders
                ? data.folders.map((f) => ({
                    label: f.name,
                    value: f.id,
                    original: f,
                  }))
                : [],
            );
          }
        });
    }
    return () => {
      isActive = false;
    };
  }, [selectedRoot]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        inventory: initialData.inventory || [],
      }));
    }
  }, [initialData]);

  useEffect(() => {
    let isActive = true;
    
    // Always clear dependent levels when level 2 selection changes
    setSelectedLevel3(null);
    setLevel3Options([]); // Add explicit clear
    setLevel4Options([]);
    setSelectedLevel4(null);

    if (selectedLevel2) {
      networkPlanningService
        .getFolderContents(selectedLevel2.value, false, "add")
        .then((data) => {
          if (isActive) {
            const children = data.folders
              ? data.folders.map((f) => ({
                  label: f.name,
                  value: f.id,
                  original: f,
                }))
              : [];
            
            if (children.length > 0) {
              setLevel3Options(children);
            } else {
              setLevel3Options([]);
            }
            // Always set type to Level 2
            setFormData((prev) => ({ ...prev, type: selectedLevel2.label }));
          }
        });
    } else {
      // Clear type if Level 2 is unselected
      setFormData((prev) => ({ ...prev, type: "" }));
    }
    return () => {
      isActive = false;
    };
  }, [selectedLevel2]);

  useEffect(() => {
    let isActive = true;
    
    // Always clear dependent levels when level 3 selection changes
    setSelectedLevel4(null);
    setLevel4Options([]); // Add explicit clear

    if (selectedLevel3) {
      networkPlanningService
        .getFolderContents(selectedLevel3.value, false, "add")
        .then((data) => {
          if (isActive) {
            const children = data.folders
              ? data.folders.map((f) => ({
                  label: f.name,
                  value: f.id,
                  original: f,
                }))
              : [];
            
            if (children.length > 0) {
              setLevel4Options(children);
            } else {
              setLevel4Options([]);
            }
            // Set region and state to Level 3
            setFormData((prev) => ({ 
              ...prev, 
              region: selectedLevel3.label,
              state: INDIAN_STATES.some(s => s.name.toLowerCase() === selectedLevel3.label.toLowerCase()) ? selectedLevel3.label : prev.state
            }));
          }
        });
    }
    return () => {
      isActive = false;
    };
  }, [selectedLevel3]);

  useEffect(() => {
    if (selectedLevel4) {
      setFormData((prev) => ({ 
        ...prev, 
        region: selectedLevel4.label,
        state: INDIAN_STATES.some(s => s.name.toLowerCase() === selectedLevel4.label.toLowerCase()) ? selectedLevel4.label : prev.state 
      }));
    }
  }, [selectedLevel4]);

  // ... state ...
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // Load Infra Providers
  useEffect(() => {
    let isActive = true;
    if (formData.popType === "Infra Provider" || formData.popType === "Managed") {
      networkPlanningService.getFolderContents(8, false, "add").then((data) => {
        if (isActive && data.folders) {
          setInfraProviderFolders(data.folders.map((f: any) => ({ id: String(f.id), name: f.name })));
        }
      }).catch(console.error);
    }
    return () => { isActive = false; };
  }, [formData.popType]);

  // Load Infra Regions when Provider changes
  useEffect(() => {
    let isActive = true;
    if (selectedInfraProviderId) {
      setInfraRegionFolders([]);
      setSelectedInfraRegionId(null);
      setInfraAvailableData([]);
      handleSelectChange("providerRegion", "");
      handleSelectChange("providerData", "");
      
      networkPlanningService.getFolderContents(Number(selectedInfraProviderId), false, "add").then((data) => {
        if (isActive && data.folders) {
          setInfraRegionFolders(data.folders.map((f: any) => ({ id: String(f.id), name: f.name })));
        }
      }).catch(console.error);
    }
    return () => { isActive = false; };
  }, [selectedInfraProviderId]);

  // Load Available Data when Region changes
  useEffect(() => {
    let isActive = true;
    if (selectedInfraRegionId) {
      setInfraAvailableData([]);
      handleSelectChange("providerData", "");
      
      networkPlanningService.getInfraList(Number(selectedInfraRegionId)).then((data) => {
        if (isActive && data) {
          setInfraAvailableData(data.map((item: { name: string; id: string | number }) => ({
            id: item.name,
            name: item.name,
          })));
        }
      }).catch(console.error);
    }
    return () => { isActive = false; };
  }, [selectedInfraRegionId]);

  // ── Connected Infra Cascading States ──
  const [infraTypeFolders, setInfraTypeFolders] = useState<{id: string; name: string}[]>([]);
  const [selectedInfraTypeId, setSelectedInfraTypeId] = useState<string | null>(null);
  const [infraStateFolders, setInfraStateFolders] = useState<{id: string; name: string}[]>([]);
  const [selectedInfraStateId, setSelectedInfraStateId] = useState<string | null>(null);
  const [infraItemsList, setInfraItemsList] = useState<{id: string; name: string}[]>([]);

  // Fetch Infrastructure type folders (only POP, Sub POP, Node, Bandwidth BTS)
  const ALLOWED_INFRA_TYPES = ["pop", "sub pop", "node", "bandwidth bts"];
  useEffect(() => {
    let isActive = true;
    networkPlanningService.getInfraTypeFolders().then((folders) => {
      if (isActive && folders) {
        const filtered = folders
          .filter((f: { id: number; name: string }) => ALLOWED_INFRA_TYPES.includes(f.name.toLowerCase()))
          .map((f: { id: number; name: string }) => ({ id: String(f.id), name: f.name }));
        setInfraTypeFolders(filtered);
      }
    }).catch((e) => console.error("Failed to fetch infra type folders:", e));
    return () => { isActive = false; };
  }, []);

  // Fetch State/UT folders when infra type changes
  useEffect(() => {
    if (!selectedInfraTypeId) {
      setInfraStateFolders([]);
      setSelectedInfraStateId(null);
      setInfraItemsList([]);
      return;
    }
    let isActive = true;
    networkPlanningService.getInfraStateFolders(parseInt(selectedInfraTypeId)).then((folders) => {
      if (isActive && folders) {
        setInfraStateFolders(folders.map((f: { id: number; name: string }) => ({ id: String(f.id), name: f.name })));
      }
    }).catch((e) => console.error("Failed to fetch infra state folders:", e));
    return () => { isActive = false; };
  }, [selectedInfraTypeId]);

  // Fetch infra items when state changes
  useEffect(() => {
    if (!selectedInfraStateId) {
      setInfraItemsList([]);
      return;
    }
    let isActive = true;
    networkPlanningService.getInfraList(parseInt(selectedInfraStateId)).then((data) => {
      if (isActive && data) {
        setInfraItemsList(data.map((item: { name: string; id?: string | number }) => ({
          id: item.name,
          name: item.name,
        })));
      }
    }).catch((e) => console.error("Failed to fetch infra items:", e));
    return () => { isActive = false; };
  }, [selectedInfraStateId]);

  // Fetch State/UT folders under the POP folder (legacy - used elsewhere)
  useEffect(() => {
    let isActive = true;
    networkPlanningService.getPopStateFolders().then((folders) => {
      if (isActive && folders) {
        setPopStateFolders(folders.map((f: { id: number; name: string }) => ({ id: String(f.id), name: f.name })));
      }
    }).catch((e) => console.error("Failed to fetch POP state folders:", e));
    return () => { isActive = false; };
  }, []);

  // Fetch POPs when a state folder is selected (legacy)
  useEffect(() => {
    if (!selectedPopStateId) {
      setPopList([]);
      return;
    }
    let isActive = true;
    networkPlanningService.getPopList(parseInt(selectedPopStateId)).then((data) => {
      if (isActive && data) {
        setPopList(data.map((pop: { name: string; id?: string | number }) => ({
          id: pop.name,
          name: pop.name
        })));
      }
    }).catch((e) => console.error("Failed to fetch POPs:", e));
    return () => { isActive = false; };
  }, [selectedPopStateId]);


  // ... handlers ...
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [],
  );

  const handleSelectChange = useCallback(
    (name: string, value: string) =>
      setFormData((prev) => ({ ...prev, [name]: value })),
    [],
  );

  const handleInfraTypeChange = useCallback((v: string) => {
    setSelectedInfraTypeId(v);
    setSelectedInfraStateId(null);
    setInfraItemsList([]);
    handleSelectChange("connectedPop", "");
  }, [handleSelectChange]);

  const handleInfraStateChange = useCallback((v: string) => {
    setSelectedInfraStateId(v);
    handleSelectChange("connectedPop", "");
  }, [handleSelectChange]);

  const handlePopStateChange = useCallback((v: string) => {
    setSelectedPopStateId(v);
    handleSelectChange("connectedPop", "");
  }, [handleSelectChange]);

  const handleLocationConfirm = useCallback((lat: string, lng: string) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setIsMapOpen(false);
  }, []);

  const handleMapClose = useCallback(() => setIsMapOpen(false), []);

  const addInventoryItem = (type: "Router" | "Switch") => {
    setFormData(prev => ({
      ...prev,
      inventory: [
        ...(prev.inventory || []),
        {
          id: Date.now().toString() + Math.random().toString(),
          type,
          name: "",
          ips: [{ id: Date.now().toString() + Math.random().toString(), value: "" }]
        }
      ]
    }));
  };

  const updateInventoryItem = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeInventoryItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== id)
    }));
  };

  const addIpToInventory = (inventoryId: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id === inventoryId) {
          return {
            ...item,
            ips: [...item.ips, { id: Date.now().toString() + Math.random().toString(), value: "" }]
          };
        }
        return item;
      })
    }));
  };

  const updateIpInInventory = (inventoryId: string, ipId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id === inventoryId) {
          return {
            ...item,
            ips: item.ips.map(ip => ip.id === ipId ? { ...ip, value } : ip)
          };
        }
        return item;
      })
    }));
  };

  const removeIpFromInventory = (inventoryId: string, ipId: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id === inventoryId) {
          return {
            ...item,
            ips: item.ips.filter(ip => ip.id !== ipId)
          };
        }
        return item;
      })
    }));
  };

  // Memoize options to preventing re-creating icon components on every render
  const rootSelectOptions = useMemo(
    () =>
      rootOptions.map((r) => ({
        id: r.value.toString(),
        name: r.label,
        icon: getIconComponent(r.label, r.original.default_icon),
      })),
    [rootOptions],
  );

  const level2SelectOptions = useMemo(
    () =>
      level2Options.map((o) => ({
        id: o.value.toString(),
        name: o.label,
        icon: getIconComponent(o.label, o.original.default_icon),
      })),
    [level2Options],
  );

  const level3SelectOptions = useMemo(
    () =>
      level3Options.map((o) => ({
        id: o.value.toString(),
        name: o.label,
        icon: getIconComponent(o.label, o.original.default_icon),
      })),
    [level3Options],
  );

  const level4SelectOptions = useMemo(
    () =>
      level4Options.map((o) => ({
        id: o.value.toString(),
        name: o.label,
        icon: getIconComponent(o.label, o.original.default_icon),
      })),
    [level4Options],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.latitude || !formData.longitude) {
      showToast.warning("Please fill in Name, Latitude and Longitude");
      return;
    }

    if (!formData.bandwidth) {
      showToast.warning("Bandwidth (MBPS) is a mandatory field.");
      return;
    }

    // Determine Parent Folder (Deepest selection)
    let parentFolderId = selectedRoot?.value || null;
    if (selectedLevel2) parentFolderId = selectedLevel2.value;
    if (selectedLevel3) parentFolderId = selectedLevel3.value;
    if (selectedLevel4) parentFolderId = selectedLevel4.value;

    if (!parentFolderId && !editingSubmissionId) {
      showToast.warning("Please select a valid Category/Type");
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine Icon Type for consistency with Frontend Map
      let targetFolder = null;
      let parentLabel = undefined;

      if (selectedLevel4) {
        targetFolder = selectedLevel4.original;
        parentLabel = selectedLevel3?.label;
      } else if (selectedLevel3) {
        targetFolder = selectedLevel3.original;
        parentLabel = selectedLevel2?.label;
      } else if (selectedLevel2) {
        targetFolder = selectedLevel2.original;
        parentLabel = selectedRoot?.label;
      } else if (selectedRoot) {
        targetFolder = selectedRoot.original;
      }

      const iconType = targetFolder
        ? getFolderIconKey(
            {
              name: targetFolder.name,
              default_icon: targetFolder.default_icon,
            },
            parentLabel,
          )
        : "DEFAULT";

      if (editingSubmissionId) {
        const resubmitPayload = {
          name: formData.name,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          properties: formData,
          iconType: iconType || "DEFAULT",
        };

        await networkPlanningService.resubmitApproval(
          editingSubmissionId,
          resubmitPayload
        );
      } else {
        await networkPlanningService.submitForApproval(
          parentFolderId,
          formData.name,
          parseFloat(formData.latitude),
          parseFloat(formData.longitude),
          formData, // Send entire form data as properties
          iconType || "DEFAULT",
        );
      }

      setShowSuccessModal(true);

      // Reset Form
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData(DEFAULT_FORM_STATE);
        setSelectedRoot(null);
        setSelectedLevel2(null);
        setSelectedLevel3(null);
        setSelectedLevel4(null);
        setSelectedPopStateId(null);
        setSelectedInfraProviderId(null);
        setSelectedInfraRegionId(null);
        setSelectedInfraTypeId(null);
        setSelectedInfraStateId(null);
        
        // Explicitly clear all options arrays to ensure UI resets immediately
        setLevel2Options([]);
        setLevel3Options([]);
        setLevel4Options([]);
        setInfraItemsList([]);
        setInfraAvailableData([]);
        setPopList([]);
        setInfraRegionFolders([]);
        setInfraProviderFolders([]);
        setInfraStateFolders([]);
      }
      // Optionally reset selections?
      // setSelectedLevel2(null);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to process infrastructure: " + (err as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCustomerCategory = selectedRoot?.label?.toLowerCase()?.includes("customer") || false;
  const isPopCategory = !isCustomerCategory && selectedLevel2 && (selectedLevel2.label.toUpperCase() === "POP" || formData.type === "POP");


  return (
    <>
      {!hideHeader && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 p-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {editingSubmissionId ? "Edit Submission" : "Add New Inventory"}
              {editingSubmissionId && (
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Editing Mode
                </span>
              )}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {editingSubmissionId 
                ? "Correct the details below to resubmit for approval." 
                : "Fill in the details below to register a new network asset."}
            </p>
          </div>
        </div>
      </div>
      )}

        <form onSubmit={handleSubmit} className={`${hideHeader ? 'pt-1 pb-8 px-2' : 'p-8'} space-y-10`}>
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Basic Information
              </h3>
            </div>
            {/* Dynamic Type Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
              {/* Level 1: Category */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Category
                </label>
                <CustomSelect
                  label=""
                  options={rootSelectOptions}
                  value={selectedRoot?.value?.toString() || ""}
                  placeholder="Select Category (e.g. Customer, Infrastructure)"
                  onChange={(val) => {
                    const found = rootOptions.find(
                      (r) => r.value.toString() === val,
                    );
                    setSelectedRoot(found);
                  }}
                />
              </div>

              {/* Level 2: Type/Subcategory */}
              {level2Options.length > 0 && (
                <div className="w-full animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Type
                  </label>
                  <CustomSelect
                    label=""
                    options={level2SelectOptions}
                    value={selectedLevel2?.value?.toString() || ""}
                    placeholder="Select Type"
                    onChange={(val) => {
                      const found = level2Options.find(
                        (o) => o.value.toString() === val,
                      );
                      setSelectedLevel2(found);
                    }}
                  />
                </div>
              )}

              {/* Level 3: Provider / State */}
              {level3Options.length > 0 && (
                <div className={`w-full animate-in fade-in slide-in-from-top-2 ${level4Options.length === 0 ? "md:col-span-2" : ""}`}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    {level4Options.length > 0 ? "Provider" : "State / Region"}
                  </label>
                  <CustomSelect
                    label=""
                    options={level3SelectOptions}
                    value={selectedLevel3?.value?.toString() || ""}
                    placeholder="Select Option"
                    onChange={(val) => {
                      const found = level3Options.find(
                        (o) => o.value.toString() === val,
                      );
                      setSelectedLevel3(found);
                    }}
                  />
                </div>
              )}

              {/* Level 4: State / Region (Conditional for Infra Providers) */}
              {level4Options.length > 0 && (
                <div className="w-full animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    State / Region
                  </label>
                  <CustomSelect
                    label=""
                    options={level4SelectOptions}
                    value={selectedLevel4?.value?.toString() || ""}
                    placeholder="Select State"
                    onChange={(val) => {
                      const found = level4Options.find(
                        (o) => o.value.toString() === val,
                      );
                      setSelectedLevel4(found);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <InputField
                label={isCustomerCategory ? "Customer Name" : isPopCategory ? "POP Name" : "Infrastructure Name"}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={isCustomerCategory ? "e.g., Enterprise Corp Ltd" : "e.g., Mumbai Central POP"}
                width="md:col-span-2"
              />
            </div>

            <div className="space-y-4 pt-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" /> Click to Place on Map
              </button>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Latitude *"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Longitude *"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
              </div>
            </div>
            
            {!isCustomerCategory && (
              <InputField
                label="Height (meters)"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 45"
              />
            )}
          </section>

          {!isCustomerCategory && !isPopCategory && (
            <>
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Address
                  </h3>
                </div>
                <div className="space-y-4">
                  <InputField
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street Address, Building"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <InputField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                    <InputField
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                    <InputField
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg shadow-sm border border-rose-100 dark:border-rose-800">
                    <Phone className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Contact Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Contact Person"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    width="md:col-span-2"
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                  />
                  <InputField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg shadow-sm border border-amber-100 dark:border-amber-800">
                    <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Rental Information
                  </h3>
                </div>
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
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none"
                  >
                    This infrastructure is rented
                  </label>
                </div>
                <AnimatePresence>
                  {formData.isRented && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-6 pl-1 pt-2"
                    >
                      <InputField
                        label="Monthly Rent (₹)"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleChange}
                        placeholder="Amount"
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
                      <div className="space-y-4">
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg shadow-sm border border-violet-100 dark:border-violet-800">
                    <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Owner & Business
                  </h3>
                </div>
                <div className="space-y-4">
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
                    placeholder="e.g., Telecom, ISP"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-sky-50 dark:bg-sky-900/30 rounded-lg shadow-sm border border-sky-100 dark:border-sky-800">
                    <CloudLightning className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Technical Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-4">
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
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none"
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
                        className="overflow-hidden space-y-6 pl-1"
                      >
                        <InputField
                          label="UPS Capacity"
                          name="upsCapacity"
                          value={formData.upsCapacity}
                          onChange={handleChange}
                          placeholder="e.g., 10 KVA"
                        />
                        <InputField
                          label="Backup Capacity"
                          name="backupCapacity"
                          value={formData.backupCapacity}
                          onChange={handleChange}
                          placeholder="e.g., 4 hours, 20 KVA"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <InputField
                  label="Bandwidth (MBPS) *"
                  name="bandwidth"
                  value={formData.bandwidth}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                />
              </section>
            </>
          )}

          {isCustomerCategory && (
            <>
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <CloudLightning className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Circuit Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                  <InputField label="Circuit Name" name="circuitName" value={formData.circuitName} onChange={handleChange} />

                  <CustomSelect
                    label="Product Type"
                    options={[
                      {id: "NNI", name: "NNI"},
                      {id: "ILL", name: "ILL"},
                      {id: "P2P", name: "P2P"},
                      {id: "P2P-2(MPLS-L3)", name: "P2P-2(MPLS-L3)"},
                      {id: "Dark Fiber", name: "Dark Fiber"}
                    ]}
                    value={formData.productType}
                    onChange={(v) => handleSelectChange("productType", v)}
                    placeholder="-- Select Product --"
                  />

                  <CustomSelect
                    label="Connected Infra Type"
                    options={infraTypeFolders.map(f => ({ ...f, icon: getIconComponent(f.name) }))}
                    value={selectedInfraTypeId || ""}
                    onChange={handleInfraTypeChange}
                    placeholder="-- Select Type (POP, BTS, etc.) --"
                  />

                  {selectedInfraTypeId && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <CustomSelect
                        label="State / UT"
                        options={infraStateFolders}
                        value={selectedInfraStateId || ""}
                        onChange={handleInfraStateChange}
                        placeholder="-- Select State / UT --"
                      />
                    </div>
                  )}

                  {selectedInfraStateId && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <SearchableSelect
                        label="Connected Infra"
                        options={infraItemsList.map(f => ({ ...f, icon: getIconComponent(infraTypeFolders.find(t => t.id === selectedInfraTypeId)?.name || f.name) }))}
                        value={formData.connectedPop}
                        onChange={(v) => handleSelectChange("connectedPop", v || "")}
                        placeholder={`Search in ${infraTypeFolders.find(f => f.id === selectedInfraTypeId)?.name || ''} - ${infraStateFolders.find(f => f.id === selectedInfraStateId)?.name || ''}...`}
                      />
                    </div>
                  )}
                  
                  <InputField label="Bandwidth (MBPS) *" name="bandwidth" value={formData.bandwidth} onChange={handleChange} placeholder="e.g., 100" />
                  
                  <CustomSelect
                    label="Media Type"
                    options={[
                      {id: "Wireless", name: "Wireless"},
                      {id: "Wireline", name: "Wireline"}
                    ]}
                    value={formData.mediaType}
                    onChange={(v) => handleSelectChange("mediaType", v)}
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Customer Address
                  </h3>
                </div>
                <div className="space-y-4">
                  <InputField label="Customer Physical Address" name="customerAddress" value={formData.customerAddress} onChange={handleChange} width="w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSelect
                      label="Region"
                      options={REGION_OPTIONS}
                      value={formData.region}
                      onChange={(v) => handleSelectChange("region", v)}
                    />
                    <CustomSelect
                      label="State"
                      options={INDIAN_STATES}
                      value={formData.state}
                      onChange={(v) => handleSelectChange("state", v)}
                    />
                    <InputField label="District" name="district" value={formData.district} onChange={handleChange} />
                    <InputField label="City/Village" name="city" value={formData.city} onChange={handleChange} />
                    <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>
              </section>

            </>
          )}

          {isPopCategory && (
            <>
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    General Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="POP ID" name="popId" value={formData.popId} onChange={handleChange} />
                    <CustomSelect
                      label="POP Type"
                      options={[
                        {id: "Infra Provider", name: "Infra Provider"},
                        {id: "Managed", name: "Managed"},
                        {id: "Building/Society", name: "Building/Society"}
                      ]}
                      value={formData.popType}
                      onChange={(v) => handleSelectChange("popType", v)}
                    />
                  </div>

                  {(formData.popType === "Infra Provider" || formData.popType === "Managed") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Site ID" name="siteId" value={formData.siteId} onChange={handleChange} />
                      
                      {/* Dynamic Provider Dropdowns */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 my-2">
                        <CustomSelect
                          label="Infra Provider"
                          options={infraProviderFolders.map(f => ({ ...f, icon: getIconComponent(f.name) }))}
                          value={selectedInfraProviderId || ""}
                          onChange={(v) => {
                            setSelectedInfraProviderId(v);
                            const provider = infraProviderFolders.find(p => p.id === v);
                            handleSelectChange("infraProvider", provider ? provider.name : "");
                          }}
                          placeholder="Select Provider"
                        />
                        <CustomSelect
                          label="Provider Region"
                          options={infraRegionFolders}
                          value={selectedInfraRegionId || ""}
                          onChange={(v) => {
                            setSelectedInfraRegionId(v);
                            const region = infraRegionFolders.find(p => p.id === v);
                            handleSelectChange("providerRegion", region ? region.name : "");
                          }}
                          placeholder={selectedInfraProviderId ? "Select Region" : "Select Provider First"}
                        />
                        <SearchableSelect
                          label="Available Data (Site)"
                          options={infraAvailableData.map(f => ({ ...f, icon: getIconComponent(selectedInfraProviderId ? infraProviderFolders.find(p => p.id === selectedInfraProviderId)?.name || f.name : f.name) }))}
                          value={infraAvailableData.find(d => d.name === formData.providerData)?.id || ""}
                          onChange={(v) => {
                            const item = infraAvailableData.find(p => p.id === v);
                            handleSelectChange("providerData", item ? item.name : "");
                          }}
                          placeholder={selectedInfraRegionId ? "-- Search / Select Site --" : "Select Region First"}
                        />
                      </div>
                      {formData.popType === "Infra Provider" && (
                        <InputField label="Reference Number (RL Number)" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} />
                      )}
                      <CustomSelect
                        label="Region"
                        options={REGION_OPTIONS}
                        value={formData.region}
                        onChange={(v) => handleSelectChange("region", v)}
                      />
                      <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />
                      <CustomSelect
                        label="State"
                        options={INDIAN_STATES}
                        value={formData.state}
                        onChange={(v) => handleSelectChange("state", v)}
                      />
                      <InputField label="District" name="district" value={formData.district} onChange={handleChange} />
                      <InputField label="City/Village" name="city" value={formData.city} onChange={handleChange} />
                      <InputField label="Area" name="area" value={formData.area} onChange={handleChange} />
                      
                      <CustomSelect
                        label="BTS Type"
                        options={[{id: "GBT", name: "GBT"}, {id: "RTT", name: "RTT"}]}
                        value={formData.btsType}
                        onChange={(v) => handleSelectChange("btsType", v)}
                      />
                      {formData.btsType === "GBT" && (
                        <InputField label="GBT Tower Height (mtr)" name="gbtTowerHeight" value={formData.gbtTowerHeight} onChange={handleChange} type="number" />
                      )}
                      {formData.btsType === "RTT" && (
                        <>
                          <InputField label="RTT Tower Height (mtr)" name="rttTowerHeight" value={formData.rttTowerHeight} onChange={handleChange} type="number" />
                          <InputField label="RTT Building Height (mtr)" name="rttBuildingHeight" value={formData.rttBuildingHeight} onChange={handleChange} type="number" />
                        </>
                      )}
                    </div>
                  )}

                  {formData.popType === "Building/Society" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Site ID" name="siteId" value={formData.siteId} onChange={handleChange} />
                      <CustomSelect
                        label="Region"
                        options={REGION_OPTIONS}
                        value={formData.region}
                        onChange={(v) => handleSelectChange("region", v)}
                      />
                      <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />
                      <CustomSelect
                        label="State"
                        options={INDIAN_STATES}
                        value={formData.state}
                        onChange={(v) => handleSelectChange("state", v)}
                      />
                      <InputField label="District" name="district" value={formData.district} onChange={handleChange} />
                      <InputField label="City/Village" name="city" value={formData.city} onChange={handleChange} />
                      <InputField label="Area" name="area" value={formData.area} onChange={handleChange} />
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-800">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Site Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Rack Type"
                    options={[{id: "Indoor", name: "Indoor"}, {id: "Outdoor", name: "Outdoor"}]}
                    value={formData.rackType}
                    onChange={(v) => handleSelectChange("rackType", v)}
                  />
                  <CustomSelect
                    label="Power Source"
                    options={[{id: "AC", name: "AC"}, {id: "DC", name: "DC"}]}
                    value={formData.powerSource}
                    onChange={(v) => handleSelectChange("powerSource", v)}
                  />
                  <CustomSelect
                    label="Phase"
                    options={[{id: "Single", name: "Single"}, {id: "Three", name: "Three"}]}
                    value={formData.powerPhase}
                    onChange={(v) => handleSelectChange("powerPhase", v)}
                  />
                  <InputField label="Power Provider" name="powerProvider" value={formData.powerProvider} onChange={handleChange} />
                  
                  <div className="flex items-center gap-3 pt-8 md:col-span-2">
                    <input
                      type="checkbox"
                      id="acAvailability"
                      name="acAvailability"
                      checked={formData.acAvailability}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="acAvailability" className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none">
                      AC Availability
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg shadow-sm border border-rose-100 dark:border-rose-800">
                    <Phone className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Contact Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.popType === "Infra Provider" || formData.popType === "Managed") && (
                    <>
                      {formData.popType === "Infra Provider" && (
                        <InputField label="Reference Number" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} />
                      )}
                      <InputField label="Rack Space" name="rackSpace" value={formData.rackSpace} onChange={handleChange} />
                      <InputField label="UBR Mounting Permission" name="ubrMountingPermission" type="number" value={formData.ubrMountingPermission} onChange={handleChange} />
                      <InputField label="Technician Name" name="technicianName" value={formData.technicianName} onChange={handleChange} />
                      <InputField label="Technician Number" name="technicianNumber" value={formData.technicianNumber} onChange={handleChange} />
                      {formData.popType === "Infra Provider" && (
                        <>
                          <InputField label="Supervisor Name" name="supervisorName" value={formData.supervisorName} onChange={handleChange} />
                          <InputField label="Supervisor Number" name="supervisorNumber" value={formData.supervisorNumber} onChange={handleChange} />
                        </>
                      )}
                    </>
                  )}

                  {formData.popType === "Building/Society" && (
                    <>
                      <InputField label="Local SPOC Name" name="localSpocName" value={formData.localSpocName} onChange={handleChange} />
                      <InputField label="Local SPOC Number" name="localSpocNumber" value={formData.localSpocNumber} onChange={handleChange} />
                      <InputField label="Chairman/Landlord Name" name="chairmanName" value={formData.chairmanName} onChange={handleChange} />
                      <InputField label="Chairman/Landlord Number" name="chairmanNumber" value={formData.chairmanNumber} onChange={handleChange} />
                    </>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg shadow-sm border border-teal-100 dark:border-teal-800">
                      <Server className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      POP Inventory
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addInventoryItem("Router")}
                      className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Router
                    </button>
                    <button
                      type="button"
                      onClick={() => addInventoryItem("Switch")}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Switch
                    </button>
                  </div>
                </div>

                {formData.inventory.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                    No inventory items added yet. Click above to add a Router or Switch.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.inventory.map((item, index) => (
                      <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${item.type === 'Router' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                              {item.type} {index + 1}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeInventoryItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="w-full md:w-1/2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model / Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateInventoryItem(item.id, 'name', e.target.value)}
                              placeholder={`e.g., Cisco ${item.type}`}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">IP Addresses</label>
                              <button
                                type="button"
                                onClick={() => addIpToInventory(item.id)}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add IP
                              </button>
                            </div>
                            
                            {item.ips.map((ip, ipIndex) => (
                              <div key={ip.id} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={ip.value}
                                  onChange={(e) => updateIpInInventory(item.id, ip.id, e.target.value)}
                                  placeholder="e.g., 192.168.1.1"
                                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                                />
                                {item.ips.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeIpFromInventory(item.id, ip.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="p-2 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-lg shadow-sm border border-fuchsia-100 dark:border-fuchsia-800">
                <FileText className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Additional Information
              </h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Notes..."
              />
            </div>
          </section>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                // Always reset local state to ensure the form clears, 
                // especially when reused in a parent workspace
                setFormData(DEFAULT_FORM_STATE);
                setSelectedRoot(null);
                setSelectedLevel2(null);
                setSelectedLevel3(null);
                setSelectedLevel4(null);
                setSelectedPopStateId(null);
                setSelectedInfraProviderId(null);
                setSelectedInfraRegionId(null);
                setSelectedInfraTypeId(null);
                setSelectedInfraStateId(null);
                
                // Explicitly clear all options arrays
                setLevel2Options([]);
                setLevel3Options([]);
                setLevel4Options([]);
                setInfraItemsList([]);
                setInfraAvailableData([]);
                setPopList([]);
                setInfraRegionFolders([]);
                setInfraProviderFolders([]);
                setInfraStateFolders([]);

                // Then trigger the parent callback if it exists
                if(onCancelEdit) {
                  onCancelEdit();
                }
              }}
              className="flex-1 py-3 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
            >
              {editingSubmissionId ? "Cancel Edit" : "Clear Form"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-white font-semibold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : (editingSubmissionId ? "Submit Corrections" : "Submit for Approval")}
            </button>
          </div>
        </form>

        {isMapOpen && (
          <LocationPickerModal
            isOpen={isMapOpen}
            initialLat={formData.latitude || "28.6139"}
            initialLng={formData.longitude || "77.209"}
            onClose={handleMapClose}
            onConfirm={handleLocationConfirm}
          />
        )}

        <SubmissionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
    </>
  );
};

export default AddInfrastructureForm;


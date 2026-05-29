import { UserFormData } from "../types";

export const getInitialFormData = (): UserFormData => ({
  username: "",
  name: "",
  email: "",
  password: "",
  gender: "",
  phoneNumber: "",
  address: {
    street: "",
    city: "",
    state: "",
    pincode: "",
  },
  department: "",
  officeLocation: "",
  assignedUnder: [],
  role: "user" as const,
  assignedRegions: [],
  groups: [],
  loginHistory: [],
  status: "Inactive",
});


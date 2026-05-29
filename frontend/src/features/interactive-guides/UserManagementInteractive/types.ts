// Types for UserManagementInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface Role {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface RowAction {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface BulkOperation {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface FormSection {
  num: number;
  title: string;
  color: string;
  fields: string[];
  notes: string;
}

export interface ValidationRule {
  field: string;
  rule: string;
}

export interface TableColumn {
  num: number;
  name: string;
  desc: string;
}

export type ColorMap = Record<string, string>;


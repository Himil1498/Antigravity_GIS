
// Form and Input Types
export interface FormState {
  forms: Record<string, FormConfig>;
  validation: FormValidation;
  autoSave: AutoSaveConfig;
}

export interface FormConfig {
  id: string;
  fields: FormField[];
  validation: ValidationRule[];
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  lastSaved?: string;
}

export interface FormField {
  name: string;
  type: InputType;
  value: any;
  defaultValue: any;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  validation: FieldValidation;
  options?: SelectOption[];
  metadata?: Record<string, any>;
}

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'color'
  | 'range'
  | 'hidden'
  | 'custom';

export interface SelectOption {
  value: any;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  group?: string;
}

export interface FieldValidation {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  errors: string[];
  warnings: string[];
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  touched: Record<string, boolean>;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'pattern' | 'min' | 'max' | 'custom';
  value: any;
  message: string;
  when?: string[];
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  onlyWhenDirty: boolean;
  showIndicator: boolean;
}


/**
 * Constants for Region Request Form feature
 * Location: Frontend/src/components/RegionRequestForm/constants.ts
 */

export const REQUEST_TYPE_OPTIONS = [
  {
    type: 'access' as const,
    label: 'Access',
    description: 'View/Edit region'
  },
  {
    type: 'modification' as const,
    label: 'Modification',
    description: 'Change region'
  },
  {
    type: 'creation' as const,
    label: 'Creation',
    description: 'New region'
  }
];

export const REQUEST_TYPE_INFO = {
  access: 'Request permission to view or edit region data',
  modification: 'Request changes to existing region boundaries or attributes',
  creation: 'Request creation of a new region or sub-region'
};

export const FORM_VALIDATION = {
  MIN_REASON_LENGTH: 10,
  MAX_REASON_LENGTH: 1000
};


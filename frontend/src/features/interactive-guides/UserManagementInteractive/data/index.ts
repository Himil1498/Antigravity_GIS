// Data index - re-exports all constants for backwards compatibility
import { Step } from '../types';
import { stepsPartOne } from './stepsDataPartOne';
import { stepsPartTwo } from './stepsDataPartTwo';

// Combine steps from both parts
export const steps: Step[] = [...stepsPartOne, ...stepsPartTwo];

// Re-export UI data
export {
  roles,
  rowActions,
  bulkOperations,
  formSections,
  validationRules,
  tableColumns,
} from './uiData';

// Re-export features data
export { proTips, keyFeatures } from './featuresData';


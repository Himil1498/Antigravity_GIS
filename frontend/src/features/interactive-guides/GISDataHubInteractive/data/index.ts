// Data index - re-exports all constants
import { stepsFirstHalf } from './stepsData';
import { stepsSecondHalf } from './stepsDataContinued';
import { Step } from '../types';

// Combine steps from both files
export const steps: Step[] = [...stepsFirstHalf, ...stepsSecondHalf];

export {
  dataTypes,
  exportFormats,
  infrastructureCategories,
  customerCompanies,
  accessMethods,
  storageComparison,
  proTips,
  useCases,
} from './uiData';


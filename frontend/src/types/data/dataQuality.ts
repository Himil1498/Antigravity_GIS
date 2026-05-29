
// ============================================================================
// Data Quality and Validation
// ============================================================================

export interface DataQualityReport {
  entity_type: 'towers' | 'coverage';
  total_records: number;
  quality_score: number; // 0-100

  completeness: {
    score: number;
    missing_fields: Array<{
      field: string;
      missing_count: number;
      percentage: number;
    }>;
  };

  accuracy: {
    score: number;
    issues: Array<{
      field: string;
      issue_type: string;
      affected_records: number;
    }>;
  };

  consistency: {
    score: number;
    conflicts: Array<{
      field: string;
      conflict_type: string;
      records: string[];
    }>;
  };

  timeliness: {
    score: number;
    outdated_records: number;
    average_age: number; // in days
  };

  recommendations: DataQualityRecommendation[];

  generated_at: string;
  generated_by: string;
}

export interface DataQualityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'completeness' | 'accuracy' | 'consistency' | 'timeliness';
  description: string;
  affected_records: number;
  suggested_action: string;
  effort_estimate: 'low' | 'medium' | 'high';
}

